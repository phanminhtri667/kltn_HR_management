import db from "../models";  // Đảm bảo import đúng mô hình Sequelize
import { Op } from "sequelize";

class TimekeepingService {
  /**
   * Hàm tính trạng thái (late/early/normal/absent)
   */
  private async calculateStatus(check_in: Date | null, check_out: Date | null) {
    const config: any = await db.WorkingHours.findOne({ where: { id: 1 } });
    if (!check_in && !check_out) return "absent";
    if (!config) return "normal";

    const [startHour, startMin] = config.start_time.split(":").map((x: string) => parseInt(x));
    const [endHour, endMin] = config.end_time.split(":").map((x: string) => parseInt(x));
    const grace = config.grace_period;

    if (check_in) {
      const startThreshold = new Date(check_in);
      startThreshold.setHours(startHour, startMin + grace, 0);
      if (check_in > startThreshold) return "late";
    }

    if (
      check_out &&
      (check_out.getHours() < endHour ||
        (check_out.getHours() === endHour && check_out.getMinutes() < endMin))
    ) {
      return "early";
    }

    return "normal";
  }

  /**
   * API lọc theo employee_id / department_id / date range
   * GET /api/timekeeping?employee_id=AD00&department_id=1&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
   */
  // Lấy chấm công của tất cả nhân viên hoặc theo các tham số lọc
  public getAllTimekeeping = async (
  reqUser: { email: string; role_code: string; department_id?: number | null },
  filters: { date_from?: string; date_to?: string; employee_id?: string; department_id?: number }
) => {
  const where: any = {};

  // Lọc theo employee_id nếu có
  if (filters.employee_id) where.employee_id = filters.employee_id;

  // Lọc theo department_id (dành cho role_2 và role_1)
  if (filters.department_id) where.department_id = filters.department_id;

  // Lọc theo date_from và date_to
  if (filters.date_from) where.work_date = { [Op.gte]: filters.date_from };
  if (filters.date_to) where.work_date = { [Op.lte]: filters.date_to };

  // Admin (role_1) có thể xem tất cả dữ liệu
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
      order: [["employee_id", "ASC"]],
    });

    return { err: 0, data: rows };
  }

  // Quản lý (role_2) chỉ có thể xem dữ liệu trong phòng ban của mình
  if (reqUser.role_code === "role_2") {
    const emp = await db.Employee.findOne({
      where: { email: reqUser.email },
      attributes: ["employee_id", "department_id"],
    });

    if (!emp) return { err: 0, data: [] };

    where.department_id = emp.department_id; // Lọc theo phòng ban của quản lý
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
      order: [["employee_id", "ASC"]],
    });

    return { err: 0, data: rows };
  }

  // Nhân viên (role_3) chỉ có thể xem dữ liệu của chính mình
  if (reqUser.role_code === "role_3") {
    const emp = await db.Employee.findOne({
      where: { email: reqUser.email },
      attributes: ["employee_id"],
    });

    if (!emp) return { err: 0, data: [] };

    where.employee_id = emp.employee_id; // Lọc theo employee_id của nhân viên
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
      order: [["employee_id", "ASC"]],
    });

    return { err: 0, data: rows };
  }

  return { err: 1, mes: "Forbidden" };
};


  /**
   * Lấy chấm công theo phòng ban (route cũ)
   */
  public getByDepartment = async (departmentId: number) => {
    try {
      const response = await db.Timekeeping.findAll({
        attributes: [
          "id",
          ["work_date", "date"],
          "check_in",
          "check_out",
          "total_hours",
          "status",
          "employee_id",
        ],
        include: [
          {
            model: db.Employee,
            attributes: ["employee_id", "full_name", "email", "department_id"],
            as: "employee",
            where: { department_id: departmentId, deleted: "0" },
            include: [
              { model: db.Department, as: "department", attributes: ["id", "code", "value"] },
            ],
          },
        ],
        order: [["work_date", "DESC"]],
      });

      return { err: 0, mes: "Get timekeeping by department successfully", data: response };
    } catch (error) {
      throw error;
    }
  };

  /**
   * Tạo mới bản ghi check-in
   */
  public createTimekeeping = async (data: any) => {
    try {
      const { employee_id, work_date, check_in } = data;

      const existing = await db.Timekeeping.findOne({
        where: { employee_id, work_date },
      });

      if (existing) {
        return { err: 1, mes: "Timekeeping already exists for this employee and date" };
      }

      const status = await this.calculateStatus(check_in ? new Date(check_in) : null, null);

      const response = await db.Timekeeping.create({
        employee_id,
        work_date,
        check_in,
        status,
      });

      return { err: 0, mes: "Create timekeeping successfully", data: response };
    } catch (error) {
      throw error;
    }
  };

  /**
   * Update checkout + tính giờ + status
   */
  public updateCheckout = async (
    employee_id: string,
    work_date: string,
    check_out: Date
  ) => {
    try {
      const record = await db.Timekeeping.findOne({ where: { employee_id, work_date } });

      if (!record) {
        return { err: 1, mes: "Timekeeping record not found" };
      }

      let total_hours = 0;
      if (record.check_in && check_out) {
        const diffMs =
          new Date(check_out).getTime() - new Date(record.check_in).getTime();
        total_hours = diffMs / 1000 / 60 / 60;
      }

      const status = await this.calculateStatus(record.check_in, check_out);

      const response = await record.update({
        check_out,
        total_hours: Number(total_hours.toFixed(2)),
        status,
      });

      return { err: 0, mes: "Checkout updated successfully", data: response };
    } catch (error) {
      throw error;
    }
  };
}

export default new TimekeepingService();
