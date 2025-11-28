// services/payrollChangeService.ts
import db from "../models";

type ChangeFilters = {
  month?: string;              // "YYYY-MM"
  employee_id?: string;        // "AD0001"
  department_id?: number;      // 1, 2, 3...
  limit?: number;
};

class PayrollChangeService {
  /**
   * Lấy danh sách change logs, kèm theo thông tin payroll + employee để FE hiển thị.
   * Tự động join để có {employee_id, month} mà không phải đọc từ JSON.
   */
  public async list(filters: ChangeFilters = {}) {
    const { month, employee_id, department_id, limit } = filters;

    // where cho bảng chính (payroll_changes)
    const whereChange: any = {}; // hiện tại không lọc trực tiếp gì ở bảng này

    // where cho payroll_payslip_lines (để lọc theo month)
    const wherePayslip: any = {};
    if (month) wherePayslip.month = month;

    // where cho employee (để lọc theo employee_id / department_id)
    const whereEmp: any = {};
    if (employee_id) whereEmp.employee_id = employee_id;
    if (department_id) whereEmp.department_id = department_id;

    const rows = await db.PayrollChange.findAll({
      where: whereChange,
      include: [
        {
          model: db.PayrollPayslipLine,
          as: "payrollPayslipLine",
          attributes: ["id", "month", "employee_id"],
          where: wherePayslip,
          include: [
            {
              model: db.Employee,
              as: "employee",
              attributes: ["employee_id", "department_id", "full_name"],
              where: whereEmp,
              required: Object.keys(whereEmp).length > 0, // chỉ bắt buộc join khi có filter theo employee/department
            },
          ],
          required: Object.keys(wherePayslip).length > 0 || Object.keys(whereEmp).length > 0,
        },
      ],
      order: [["changed_at", "DESC"]],
      ...(limit ? { limit } : {}),
    });

    // Chuẩn hoá data trả về (gộp các trường cần thiết để FE dùng thẳng)
    const data = rows.map((r: any) => {
      const p = r.payrollPayslipLine || {};
      const e = p.employee || {};
      return {
        id: r.id,
        payroll_id: r.payroll_id,
        change_type: r.change_type,
        // old_data: r.old_data,          // JSONB -> object
        // new_data: r.new_data,          // JSONB -> object
        old_data: JSON.parse(r.old_data),  // Parse old_data from string to object
        new_data: JSON.parse(r.new_data),  // Parse new_data from string to object
        description: r.description,
        changed_at: r.changed_at,
        // enrich fields for FE
        employee_id: e.employee_id ?? p.employee_id ?? null,
        department_id: e.department_id ?? null,
        employee_name: e.full_name ?? null,
        month: p.month ?? null,
      };
    });

    return { err: 0, data };
  }
}

export default new PayrollChangeService();
