"use strict";

import db from "../models"; // Sequelize models
import { Op, Transaction } from "sequelize";
import moment from "moment-timezone";

// Config constants
const WORKING_DAYS_PER_MONTH = 26;
const HOURS_PER_DAY = 8;

// Types
type ReqUser = { email: string; role_code: string; department_id?: number | null };
type GetAllFilters = { month?: string; department_id?: number; employee_id?: string };

class PayrollService {
  // ===================== READ =====================
  // Lấy bảng lương chi tiết của tất cả nhân viên theo tháng, phòng ban, hoặc nhân viên
  public getAllPayrolls = async (reqUser: ReqUser, filters: GetAllFilters) => {
    // role_2 & role_3: chỉ được xem của chính mình
    if (reqUser.role_code === "role_2" || reqUser.role_code === "role_3") {
      const emp = await db.Employee.findOne({
        where: { email: reqUser.email },
        attributes: ["employee_id"],
      });
      if (!emp) return { err: 0, data: [] };

      const where: any = { employee_id: emp.employee_id };
      if (filters.month) where.month = filters.month;

      const rows = await db.PayrollPayslipLine.findAll({
        where,
        include: [
          {
            model: db.Employee,
            as: "employee",
            attributes: ["employee_id", "full_name", "basic_salary", "department_id"],
            include: [
              { model: db.Department, as: "department", attributes: ["value"] },
              { model: db.Position, as: "position", attributes: ["value"] },
            ],
          },
        ],
        order: [["employee_id", "ASC"]],
      });
      return { err: 0, data: rows };
    }

    // role_1: xem tất cả; hỗ trợ lọc department_id, month, employee_id
    if (reqUser.role_code === "role_1") {
      const where: any = {};
      if (filters.month) where.month = filters.month;
      if (filters.employee_id) where.employee_id = filters.employee_id;

      const includeEmp: any = {
        model: db.Employee,
        as: "employee",
        attributes: ["employee_id", "full_name", "basic_salary", "department_id"],
        include: [
          { model: db.Department, as: "department", attributes: ["value"] },
          { model: db.Position, as: "position", attributes: ["value"] },
        ],
      };
      if (filters.department_id) {
        includeEmp.where = { department_id: Number(filters.department_id) };
        includeEmp.required = true;
      }

      const rows = await db.PayrollPayslipLine.findAll({
        where,
        include: [includeEmp],
        order: [["employee_id", "ASC"]],
      });
      return { err: 0, data: rows };
    }

    return { err: 1, mes: "Forbidden" };
  };

  // ===================== ENSURE (WRITE) =====================
  // Gọi khi là NGÀY 1 (Asia/Ho_Chi_Minh) & role_1/role_2: đảm bảo tạo đủ bảng lương tháng trước cho ALL employees
  public ensureOnDay1All = async (role_code: string) => {
    if (!role_code || !["role_1", "role_2"].includes(role_code)) {
      return { err: 0, mes: "Skipped (role not allowed)" };
    }
    const now = moment().tz("Asia/Ho_Chi_Minh");
    if (now.date() !== 1) {
      return { err: 0, mes: "Skipped (not day 1)" };
    }
    const month = now.clone().subtract(1, "month").format("YYYY-MM");
    return this.ensurePayrollForMonthAllEmployees(month);
  };

  // Tạo CÁC BẢN GHI CÒN THIẾU cho toàn bộ nhân viên của 1 tháng (idempotent)
  // ⚠️ Không dùng transaction ở phần đọc để tránh rollback chain; chỉ bulkCreate với ignoreDuplicates.
  public ensurePayrollForMonthAllEmployees = async (month: string) => {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return { err: 1, mes: `Invalid month format: ${month}` };
    }

    try {
      const startDate = moment(month, "YYYY-MM").startOf("month").format("YYYY-MM-DD");
      const endDate = moment(month, "YYYY-MM").endOf("month").format("YYYY-MM-DD");

      // ĐỌC từ DB (không transaction)
      const [employees, existedRows, allowancesSum, deductions, otPolicies] = await Promise.all([
        db.Employee.findAll(),
        db.PayrollPayslipLine.findAll({ where: { month }, attributes: ["employee_id"] }),
        db.Allowance.sum("amount"), // tổng phụ cấp từ bảng allowances
        db.Deduction.findAll(),     // danh sách các khoản khấu trừ (tính % tổng)
        db.OvertimePolicy.findAll() // chính sách OT (bắt buộc phải có)
      ]);

      // Bắt buộc phải có chính sách OT
      if (!otPolicies || otPolicies.length === 0) {
        return { err: 1, mes: "No overtime policies in DB (overtime_policies)" };
      }

      // Map hệ số OT theo DB (KHÔNG set cứng)
      const multipliers: Record<string, number> = {};
      for (const p of otPolicies) {
        multipliers[p.day_type] = Number(p.multiplier);
      }
      // Đảm bảo đủ 3 loại hệ số
      const missing: string[] = ["weekday", "weekend", "holiday"].filter(k => multipliers[k] == null);
      if (missing.length > 0) {
        return { err: 1, mes: `Missing OT multipliers for: ${missing.join(", ")}` };
      }

      // Khấu trừ: nếu không có dòng nào trong DB => 0%
      const deductionPercent =
        deductions.reduce((s: number, d: any) => s + Number(d.percent), 0) / 100;

      // Phụ cấp: tổng theo bảng allowances
      const totalAllowance = Number(allowancesSum || 0);

      const caches = { totalAllowance, deductionPercent, multipliers };
      const existedSet = new Set(existedRows.map((r: any) => r.employee_id));
      const rowsToInsert: any[] = [];

      for (const emp of employees) {
        if (existedSet.has(emp.employee_id)) continue; // đã có -> bỏ qua
        const row = await this.buildPayslipRow(emp, startDate, endDate, month, caches);
        rowsToInsert.push(row);
      }

      if (rowsToInsert.length === 0) {
        return { err: 0, mes: `Payslips for ${month} already complete` };
      }

      // GHI: idempotent nhờ UNIQUE (employee_id, month) + ignoreDuplicates
      await db.PayrollPayslipLine.bulkCreate(rowsToInsert, { ignoreDuplicates: true });

      return { err: 0, mes: `Created ${rowsToInsert.length} missing payslips for ${month}` };
    } catch (e) {
      console.error("ensurePayrollForMonthAllEmployees error:", e);
      return { err: 1, mes: "Ensure payroll failed" };
    }
  };

  // ===================== GENERATE (WRITE, optional manual) =====================
  // Tạo toàn bộ payslips cho 1 tháng; nếu đã có & regenerate=false -> báo 409
  public generatePayroll = async (monthArg?: string, opts?: { regenerate?: boolean }) => {
    const regenerate = !!opts?.regenerate;
    const month = monthArg || moment().format("YYYY-MM");
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return { err: 1, mes: `Invalid month format: ${month}` };
    }

    const startDate = moment(month, "YYYY-MM").startOf("month").format("YYYY-MM-DD");
    const endDate = moment(month, "YYYY-MM").endOf("month").format("YYYY-MM-DD");

    const existed = await db.PayrollPayslipLine.count({ where: { month } });
    if (existed > 0 && !regenerate) {
      return { err: 1, mes: `Payslips for ${month} already exist`, code: 409 };
    }

    return await db.sequelize.transaction(async (t: Transaction) => {
      if (regenerate) {
        await db.PayrollPayslipLine.destroy({ where: { month }, transaction: t });
      }

      const [employees, allowancesSum, deductions, otPolicies] = await Promise.all([
        db.Employee.findAll({ transaction: t }),
        db.Allowance.sum("amount", { transaction: t }),
        db.Deduction.findAll({ transaction: t }),
        db.OvertimePolicy.findAll({ transaction: t }),
      ]);

      if (!otPolicies || otPolicies.length === 0) {
        throw new Error("No overtime policies in DB (overtime_policies)");
      }

      const multipliers: Record<string, number> = {};
      for (const p of otPolicies) {
        multipliers[p.day_type] = Number(p.multiplier);
      }
      const missing: string[] = ["weekday", "weekend", "holiday"].filter(k => multipliers[k] == null);
      if (missing.length > 0) {
        throw new Error(`Missing OT multipliers for: ${missing.join(", ")}`);
      }

      const deductionPercent =
        deductions.reduce((s: number, d: any) => s + Number(d.percent), 0) / 100;

      const totalAllowance = Number(allowancesSum || 0);

      const caches = { totalAllowance, deductionPercent, multipliers };
      const rowsToInsert: any[] = [];

      for (const emp of employees) {
        const row = await this.buildPayslipRow(emp, startDate, endDate, month, caches, t);
        rowsToInsert.push(row);
      }

      await db.PayrollPayslipLine.bulkCreate(rowsToInsert, { transaction: t });
      return { err: 0, mes: `Generated payslips for ${month}` };
    });
  };

  // ===================== PRIVATE HELPERS =====================
  private async buildPayslipRow(
    emp: any,
    startDate: string,
    endDate: string,
    month: string,
    caches: { totalAllowance: number; deductionPercent: number; multipliers: Record<string, number> },
    t?: Transaction
  ) {
    const tks = await db.Timekeeping.findAll({
      where: {
        employee_id: emp.employee_id,
        work_date: { [Op.between]: [startDate, endDate] },
      },
      transaction: t, // optional: có khi generatePayroll dùng transaction
    });

    const totalWorkHours =
      tks.reduce((s: number, tk: any) => s + Number(tk.total_hours || 0), 0) -
      tks.reduce(
        (s: number, tk: any) =>
          s +
          Number(tk.ot_weekday_hours || 0) +
          Number(tk.ot_weekend_hours || 0) +
          Number(tk.ot_holiday_hours || 0),
        0
      );

    const absentDays = tks.filter((tk: any) => tk.status === "absent").length;

    const basic = Number(emp.basic_salary || 0);
    const actualSalary = basic - (basic / WORKING_DAYS_PER_MONTH) * absentDays;

    const otWeekday = tks.reduce((s: number, tk: any) => s + Number(tk.ot_weekday_hours || 0), 0);
    const otWeekend = tks.reduce((s: number, tk: any) => s + Number(tk.ot_weekend_hours || 0), 0);
    const otHoliday = tks.reduce((s: number, tk: any) => s + Number(tk.ot_holiday_hours || 0), 0);

    const hourlyRate = basic / WORKING_DAYS_PER_MONTH / HOURS_PER_DAY;

    // Dùng hệ số từ DB (đã check đủ 3 loại trước đó)
    const overtimeAmount =
      otWeekday * hourlyRate * caches.multipliers["weekday"] +
      otWeekend * hourlyRate * caches.multipliers["weekend"] +
      otHoliday * hourlyRate * caches.multipliers["holiday"];

    const totalAmount = actualSalary + overtimeAmount + caches.totalAllowance;
    const deduction = totalAmount * caches.deductionPercent;
    const receivedSalary = totalAmount - deduction;

    return {
      employee_id: emp.employee_id,
      total_work_hours: totalWorkHours,
      absent_days: absentDays,
      actual_salary: actualSalary,
      ot_weekday_hours: otWeekday,
      ot_weekend_hours: otWeekend,
      ot_holiday_hours: otHoliday,
      overtime_amount: overtimeAmount,
      allowance: caches.totalAllowance,
      total_amount: totalAmount,
      deduction,
      received_salary: receivedSalary,
      month,
    };
  }
  // Cập nhật bảng lương khi có thay đổi dữ liệu (nếu status='draft'); ghi nhận thay đổi vào bảng payroll_changes
  // PayrollService.ts
public async updatePayrollWhenDataChangesByEmployee(
  employeeId: string,
  monthArg?: string,              // có thể truyền vào hoặc để hàm tự lấy gần nhất
  updatedData?: Record<string, any> // nếu có field mới từ FE (vd: basic_salary) dùng để update Employee trước khi rebuild
) {
  return await db.sequelize.transaction(async (t: Transaction) => {
    // 1) Xác định payslip cần cập nhật
    const wherePayslip: any = { employee_id: employeeId };
    if (monthArg) wherePayslip.month = monthArg;

    const payroll = await db.PayrollPayslipLine.findOne({
      where: wherePayslip,
      order: [["month", "DESC"]], // nếu không truyền month => lấy gần nhất
      transaction: t,
    });

    if (!payroll) {
      return { err: 1, mes: "Payroll record not found for this employee/month" };
    }

    // 2) Chỉ cho update khi status = draft
    if (payroll.status !== "draft") {
      return { err: 1, mes: "Payroll status is not 'draft', can't update" };
    }

    // 3) Lấy employee
    const emp = await db.Employee.findOne({
      where: { employee_id: employeeId },
      transaction: t,
    });
    if (!emp) {
      return { err: 1, mes: "Employee not found" };
    }

    // 3.1) Nếu có updatedData (vd FE đổi basic_salary), cập nhật Employee trước khi rebuild payslip
    if (updatedData && Object.keys(updatedData).length > 0) {
      // không cho đổi khóa chính
      const { employee_id, ...safe } = updatedData;
      await db.Employee.update(safe, { where: { employee_id: employeeId }, transaction: t });
      // reload lại emp để lấy giá trị mới (vd basic_salary mới)
      await emp.reload({ transaction: t });
    }

    // 4) Chuẩn bị tham số cho buildPayslipRow
    const month = payroll.month; // dạng "YYYY-MM"
    const startDate = moment(month, "YYYY-MM").startOf("month").format("YYYY-MM-DD");
    const endDate   = moment(month, "YYYY-MM").endOf("month").format("YYYY-MM-DD");

    // 4.1) Nạp caches (allowance, deduction %, OT multipliers)
    const [allowancesSum, deductions, otPolicies] = await Promise.all([
      db.Allowance.sum("amount", { transaction: t }),
      db.Deduction.findAll({ transaction: t }),
      db.OvertimePolicy.findAll({ transaction: t }),
    ]);

    if (!otPolicies || otPolicies.length === 0) {
      return { err: 1, mes: "No overtime policies in DB (overtime_policies)" };
    }
    const multipliers: Record<string, number> = {};
    for (const p of otPolicies) multipliers[p.day_type] = Number(p.multiplier);
    const missing = ["weekday", "weekend", "holiday"].filter((k) => multipliers[k] == null);
    if (missing.length > 0) {
      return { err: 1, mes: `Missing OT multipliers for: ${missing.join(", ")}` };
    }

    const deductionPercent =
      deductions.reduce((s: number, d: any) => s + Number(d.percent), 0) / 100;
    const totalAllowance = Number(allowancesSum || 0);

    const caches = { totalAllowance, deductionPercent, multipliers };

    // 5) Rebuild payslip row
    const newRow = await this.buildPayslipRow(
      emp, startDate, endDate, month, caches, t
    );

    // 6) Tính các cột thay đổi để log
    const compareFields = [
      "total_work_hours", "absent_days", "actual_salary",
      "ot_weekday_hours", "ot_weekend_hours", "ot_holiday_hours",
      "overtime_amount", "allowance", "total_amount",
      "deduction", "received_salary"
    ];
    const changedColumns = compareFields.filter((f) => String(payroll.get(f)) !== String((newRow as any)[f]));

    // 7) Log thay đổi
    await this.logPayrollChanges(
      payroll.id,                  // lưu ý: id của bản payslip
      payroll.get(),               // oldData
      newRow,                      // newData
      changedColumns,              // cột đổi
      t
    );

    // 8) Cập nhật payslip
    await payroll.update(newRow, { transaction: t });

    return { err: 0, mes: "Payroll updated (by employee & month) and changes logged successfully" };
  });
}


// Ghi nhận sự thay đổi vào bảng payroll_changes
private async logPayrollChanges(
  payrollId: number,
  oldData: Record<string, any>,
  newData: Record<string, any>,
  changedColumns: string[],
  t: Transaction
) {
  // So sánh sau chuẩn hoá
  const norm = (v: any) =>
    v == null ? "" : (typeof v === "number" ? Number(v).toFixed(2) : String(v));

  // Loại bỏ field không cần & đảm bảo status/updated_at
  const pickForAudit = (src: Record<string, any>, extras: Record<string, any> = {}) => {
    const { id, employee_id, created_at, createdAt, ...rest } = src || {};
    const out: Record<string, any> = { ...rest, ...extras };
    if (out.status == null && src?.status != null) out.status = src.status;
    out.updated_at = src?.updated_at ?? src?.updatedAt ?? new Date().toISOString();
    return out;
  };
  
  // NEW: format toàn bộ số trong object thành chuỗi 2 chữ số thập phân
  const toFixed2AllNumbers = (obj: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) =>
        typeof v === "number" ? [k, Number(v).toFixed(2)] : [k, v]
      )
    );
    // ➕ ADD: sắp xếp key theo alphabet để stringify ra ổn định, dễ đọc
  const sortKeys = (obj: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.keys(obj || {}).sort().forEach(k => { out[k] = obj[k]; });
    return out;
  };

  // Bản đã lọc cho old/new
  const oldForAuditRaw = pickForAudit(oldData);
  const newForAuditRaw = pickForAudit(newData, { status: oldData?.status, updated_at: new Date().toISOString() });

  // Lấy đúng các cột thực sự thay đổi
  const actualChanged = changedColumns.filter(f => norm(oldData[f]) !== norm(newData[f]));
  if (actualChanged.length === 0) return;

  const description = actualChanged
    .map(f => `${f}: ${norm(oldData[f])} => ${norm(newData[f])}`)
    .join(", ");

  // Áp dụng định dạng 2 chữ số thập phân rồi sắp xếp key trước khi lưu
  const oldForAudit = sortKeys(toFixed2AllNumbers(oldForAuditRaw));  // ➕ ADD: sortKeys
  const newForAudit = sortKeys(toFixed2AllNumbers(newForAuditRaw));  // ➕ ADD: sortKeys


  await db.PayrollChange.create(
    {
      payroll_id: payrollId,
      change_type: "data",
      old_data: JSON.stringify(oldForAudit),
      new_data: JSON.stringify(newForAudit),
      description,
    },
    { transaction: t }
  );
}






// Tự động duyệt bảng lương của tháng trước vào ngày 6 (nếu chưa duyệt)
public async autoApprovePayrollsForPreviousMonth() {
  const now = moment().tz("Asia/Ho_Chi_Minh");
  if (now.date() > 5) {
    const lastMonth = now.clone().subtract(1, "month").format("YYYY-MM");

    // Cập nhật trạng thái cho các bảng lương của tháng trước
    await db.PayrollPayslipLine.update(
      { status: "approved" },
      { where: { month: lastMonth, status: "draft" } }
    );

    return { err: 0, mes: `Status of payrolls for ${lastMonth} updated to 'approved'.` };
  }

  return { err: 1, mes: "Payrolls are not approved yet (before day 6)." };
}
/**public async autoApprovePayrollsForPreviousMonth() {
  const now = moment().tz("Asia/Ho_Chi_Minh");  // Lấy thời gian hiện tại theo múi giờ Ho Chi Minh
  const lastMonth = now.clone().subtract(1, "month").format("YYYY-MM");  // Tính tháng trước

  // Cập nhật trạng thái cho các bảng lương của tháng trước từ "draft" thành "approved"
  await db.PayrollPayslipLine.update(
    { status: "draft" },
    { where: { month: lastMonth, status: "approved" } }
  );

  return { err: 0, mes: `Status of payrolls for ${lastMonth} updated to 'approved'.` };  // Trả về thông báo thành công
}*/
}

export default new PayrollService();
