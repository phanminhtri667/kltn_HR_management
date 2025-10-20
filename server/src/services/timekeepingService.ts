import db from "../models";  // Đảm bảo import đúng mô hình Sequelize
import { Op } from "sequelize";

class TimekeepingService {
  /**
   * Hàm tính trạng thái (late/early/normal/absent)
   */
  private async getWorkingHoursConfig() {
    // Bạn có bảng working_hours(id=1): start_time, end_time, grace_period
    const config = await db.WorkingHours.findOne({ where: { id: 1 } });
    // fallback mặc định 08:00-17:00, grace 10 phút
    return config || { start_time: "08:00:00", end_time: "17:00:00", grace_period: 10 };
  }
  private minutesFromHHMMSS(t: string): number {
    const [h, m, s] = t.split(":").map((x) => parseInt(x, 10));
    return h * 60 + m + Math.floor((s || 0) / 60);
  }
  private async calculateStatus(check_in: string | null, check_out: string | null) {
    if (!check_in && !check_out) return "Absent";

    const cfg = await this.getWorkingHoursConfig();
    const startLimit = this.minutesFromHHMMSS(cfg.start_time) + Number(cfg.grace_period || 0);
    const endLimit = this.minutesFromHHMMSS(cfg.end_time);

    if (check_in) {
      const arrive = this.minutesFromHHMMSS(check_in);
      if (arrive > startLimit) return "Late";
    }

    if (check_out) {
      const leave = this.minutesFromHHMMSS(check_out);
      if (leave < endLimit) return "Early";
    }

    return "On time";
  }

  /**
   * API lọc theo employee_id / department_id / date range
   * GET /api/timekeeping?employee_id=AD00&department_id=1&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
   */
  // Lấy chấm công của tất cả nhân viên hoặc theo các tham số lọc
  // public getAllTimekeeping = async (
  //   reqUser: { email: string; role_code: string; department_id?: number | null },
  //   filters: { date_from?: string; date_to?: string; employee_id?: string; department_id?: number }
  // ) => {
  //   const where: any = {};
  
  //   // Lọc theo employee_id nếu có
  //   if (filters.employee_id) where.employee_id = filters.employee_id;
  
  //   // Lọc theo department_id (dành cho role_2 và role_1)
  //   if (filters.department_id) where.department_id = filters.department_id;
  
  //   // Lọc theo date_from và date_to
  //   if (filters.date_from) where.work_date = { [Op.gte]: filters.date_from };
  //   if (filters.date_to) where.work_date = { [Op.lte]: filters.date_to };
  
  //   // Admin (role_1) có thể xem tất cả dữ liệu
  //   if (reqUser.role_code === "role_1") {
  //     const rows = await db.Timekeeping.findAll({
  //       where,
  //       include: [{
  //         model: db.Employee,
  //         as: "employee",
  //         attributes: ["employee_id", "full_name", "department_id"],
  //         include: [
  //           { model: db.Department, as: "department", attributes: ["value"] },
  //           { model: db.Position, as: "position", attributes: ["value"] },
  //         ],
  //       }],
  //       order: [["employee_id", "ASC"]],
  //     });
  
  //     return { err: 0, data: rows };
  //   }
  
  //   // Quản lý (role_2) chỉ có thể xem dữ liệu trong phòng ban của mình
  //   if (reqUser.role_code === "role_2") {
  //     const emp = await db.Employee.findOne({
  //       where: { email: reqUser.email },
  //       attributes: ["employee_id", "department_id"],
  //     });
  
  //     if (!emp) return { err: 0, data: [] };
  
  //     where.department_id = emp.department_id; // Lọc theo phòng ban của quản lý
  //     const rows = await db.Timekeeping.findAll({
  //       where,
  //       include: [{
  //         model: db.Employee,
  //         as: "employee",
  //         attributes: ["employee_id", "full_name", "department_id"],
  //         include: [
  //           { model: db.Department, as: "department", attributes: ["value"] },
  //           { model: db.Position, as: "position", attributes: ["value"] },
  //         ],
  //       }],
  //       order: [["employee_id", "ASC"]],
  //     });
  
  //     return { err: 0, data: rows };
  //   }
  
  //   // Nhân viên (role_3) chỉ có thể xem dữ liệu của chính mình
  //   if (reqUser.role_code === "role_3") {
  //     const emp = await db.Employee.findOne({
  //       where: { email: reqUser.email },
  //       attributes: ["employee_id"],
  //     });
  
  //     if (!emp) return { err: 0, data: [] };
  
  //     where.employee_id = emp.employee_id; // Lọc theo employee_id của nhân viên
  //     const rows = await db.Timekeeping.findAll({
  //       where,
  //       include: [{
  //         model: db.Employee,
  //         as: "employee",
  //         attributes: ["employee_id", "full_name", "department_id"],
  //         include: [
  //           { model: db.Department, as: "department", attributes: ["value"] },
  //           { model: db.Position, as: "position", attributes: ["value"] },
  //         ],
  //       }],
  //       order: [["employee_id", "ASC"]],
  //     });
  
  //     return { err: 0, data: rows };
  //   }
  
  //   return { err: 1, mes: "Forbidden" };
  // };
    /** GET all / filter (role-aware) */
    public async getAllTimekeeping(
      reqUser: { email: string; role_code: string; department_id?: number | null },
      filters: { date_from?: string; date_to?: string; employee_id?: string; department_id?: number }
    ) {
      const where: any = {};
  
      if (filters.employee_id) where.employee_id = filters.employee_id;
      if (filters.department_id) where.department_id = filters.department_id;
  
      if (filters.date_from && filters.date_to) {
        where.work_date = { [Op.between]: [filters.date_from, filters.date_to] };
      } else if (filters.date_from) {
        where.work_date = { [Op.gte]: filters.date_from };
      } else if (filters.date_to) {
        where.work_date = { [Op.lte]: filters.date_to };
      }
  
      // role_1: xem tất cả
      if (reqUser.role_code === "role_1") {
        const rows = await db.Timekeeping.findAll({
          where,
          include: [{
            model: db.Employee,
            as: "employee",
            attributes: ["employee_id", "full_name", "department_id"],
            include: [
              { model: db.Department, as: "department", attributes: ["value"] },
              { model: db.Position, as: "position", attributes: ["value"] },
            ],
          }],
          order: [["work_date", "DESC"], ["employee_id", "ASC"]],
        });
        return { err: 0, data: rows };
      }
  
      // role_2: chỉ phòng ban mình quản lý
      if (reqUser.role_code === "role_2") {
        const emp = await db.Employee.findOne({ where: { email: reqUser.email }, attributes: ["department_id"] });
        if (!emp) return { err: 0, data: [] };
        where.department_id = emp.department_id;
        const rows = await db.Timekeeping.findAll({
          where,
          include: [{
            model: db.Employee,
            as: "employee",
            attributes: ["employee_id", "full_name", "department_id"],
            include: [{ model: db.Department, as: "department", attributes: ["value"] }],
          }],
          order: [["work_date", "DESC"], ["employee_id", "ASC"]],
        });
        return { err: 0, data: rows };
      }
  
      // role_3: chỉ của chính mình
      if (reqUser.role_code === "role_3") {
        const emp = await db.Employee.findOne({ where: { email: reqUser.email }, attributes: ["employee_id"] });
        if (!emp) return { err: 0, data: [] };
        where.employee_id = emp.employee_id;
        const rows = await db.Timekeeping.findAll({
          where,
          include: [{
            model: db.Employee,
            as: "employee",
            attributes: ["employee_id", "full_name", "department_id"],
            include: [{ model: db.Department, as: "department", attributes: ["value"] }],
          }],
          order: [["work_date", "DESC"]],
        });
        return { err: 0, data: rows };
      }
  
      return { err: 1, mes: "Forbidden" };
    }
  

  
    public async getByDepartment(reqUser: { role_code: string }, departmentId: number) {
      if (reqUser.role_code !== "role_1" && reqUser.role_code !== "role_2") {
        return { err: 1, mes: "Access Forbidden" };
      }
      const rows = await db.Timekeeping.findAll({
        attributes: [
          "id",
          ["work_date", "date"],
          "check_in",
          "check_out",
          "total_hours",
          "status",
          "employee_id",
        ],
        where: { department_id: departmentId },
        include: [{
          model: db.Employee,
          as: "employee",
          attributes: ["employee_id", "full_name", "email", "department_id"],
          where: { department_id: departmentId, deleted: "0" },
          include: [{ model: db.Department, as: "department", attributes: ["id", "code", "value"] }],
        }],
        order: [["work_date", "DESC"]],
      });
      return { err: 0, mes: "Get timekeeping by department successfully", data: rows };
    }  

  /**
   * Tạo mới bản ghi check-in
   */
  private pad(n: number) { return String(n).padStart(2, "0"); }
  private nowDate(): string {
    const d = new Date();
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }

  private nowTime(): string {
    const d = new Date();
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}:${this.pad(d.getSeconds())}`;
  }

  private toTimeStr(d: Date): string {
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}:${this.pad(d.getSeconds())}`;
  }
  public async createTimekeeping(body: any) {
    const employee_id: string = String(body.employee_id).trim();
    const work_date: string = (body.work_date || this.nowDate()).slice(0, 10);
    const check_in: string = body.check_in
      ? body.check_in.length === 8 ? body.check_in : this.toTimeStr(new Date(body.check_in))
      : this.nowTime();

    // lấy department_id từ Employee để lưu vào bản ghi
    const emp = await db.Employee.findOne({
      where: { employee_id },
      attributes: ["employee_id", "department_id"],
    });
    if (!emp) return { err: 1, mes: "Employee not found" };

    const existed = await db.Timekeeping.findOne({ where: { employee_id, work_date } });
    if (existed) return { err: 1, mes: "Already checked in today" };

    const status = await this.calculateStatus(check_in, null);

    const row = await db.Timekeeping.create({
      employee_id,
      department_id: emp.department_id ?? null, // ✅
      work_date,
      check_in,
      check_out: null,
      total_hours: 0,
      status,
      ot_weekday_hours: 0,
      ot_weekend_hours: 0,
      ot_holiday_hours: 0,
    });

    return { err: 0, mes: "Check-in successfully", data: row };
  }
  
  

  /**
   * Update checkout + tính giờ + status
   */
  private diffHours(startHHMMSS: string, endHHMMSS: string): number {
    let diff = this.minutesFromHHMMSS(endHHMMSS) - this.minutesFromHHMMSS(startHHMMSS);
    if (diff < 0) diff = 0; // không xử lý qua ngày ở scope hiện tại
    return Math.round((diff / 60) * 100) / 100;
  }
  public async updateCheckout(employee_id: string, work_date: string, check_out_input?: Date | string) {
    try {
      const workDate = (work_date || new Date().toISOString().slice(0, 10));
  
      // ✅ Chuẩn hóa check_out về dạng HH:mm:ss
      let checkOutStr: string;
  
      if (check_out_input instanceof Date) {
        checkOutStr = check_out_input.toTimeString().split(" ")[0];
      } else if (typeof check_out_input === "string") {
        // Nếu chỉ gửi "14:31:08" thì giữ nguyên
        checkOutStr = check_out_input.length === 8
          ? check_out_input
          : new Date(check_out_input).toTimeString().split(" ")[0];
      } else {
        // Nếu không có input, dùng giờ hiện tại
        checkOutStr = new Date().toTimeString().split(" ")[0];
      }
  
      // ✅ Tìm bản ghi
      const record = await db.Timekeeping.findOne({ where: { employee_id, work_date: workDate } });
      if (!record) return { err: 1, mes: "Timekeeping record not found" };
      if (!record.check_in) return { err: 1, mes: "No check-in recorded" };
      if (record.check_out) return { err: 1, mes: "Already checked out" };
  
      // ✅ Tính tổng giờ làm
      const checkInDate = new Date(`${workDate}T${record.check_in}`);
      const checkOutDate = new Date(`${workDate}T${checkOutStr}`);
      const totalHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
  
      // ✅ Tính status & OT
      const status = await this.calculateStatus(record.check_in, checkOutStr);
      const ot = await this.calculateOT(workDate, checkOutStr);
  
      // ✅ Update vào DB
      const updated = await record.update({
        check_out: checkOutStr,
        total_hours: Number(totalHours.toFixed(2)),
        status,
        ot_weekday_hours: ot.weekday,
        ot_weekend_hours: ot.weekend,
        ot_holiday_hours: ot.holiday,
      });
  
      return { err: 0, mes: "Checkout updated successfully", data: updated };
    } catch (error) {
      console.error("Error while updating checkout:", error);
      return { err: 1, mes: "Internal server error" };
    }
  }
  
  
  
  
  private async isHoliday(dateYYYYMMDD: string): Promise<boolean> {
    const row = await db.PublicHoliday.findOne({ where: { date: dateYYYYMMDD } }).catch(() => null);
    return !!row;
  }

  private isWeekend(dateYYYYMMDD: string): boolean {
    const d = new Date(dateYYYYMMDD);
    const dow = d.getDay(); // 0 CN, 6 T7
    return dow === 0 || dow === 6;
  }
  private async calculateOT(work_date: string, check_out: string): Promise<{
    weekday: number; weekend: number; holiday: number;
  }> {
    const cfg = await this.getWorkingHoursConfig();
    const endLimitMin = this.minutesFromHHMMSS(cfg.end_time);
    const outMin = this.minutesFromHHMMSS(check_out);
    const overtimeHours = Math.max(0, (outMin - endLimitMin) / 60);

    if (overtimeHours <= 0) return { weekday: 0, weekend: 0, holiday: 0 };

    if (await this.isHoliday(work_date)) {
      return { weekday: 0, weekend: 0, holiday: Math.round(overtimeHours * 100) / 100 };
    }
    if (this.isWeekend(work_date)) {
      return { weekday: 0, weekend: Math.round(overtimeHours * 100) / 100, holiday: 0 };
    }
    return { weekday: Math.round(overtimeHours * 100) / 100, weekend: 0, holiday: 0 };
  }
  
  
}

export default new TimekeepingService();
