import db from "../models";
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
  public async list(filters: {
    employee_id?: string | undefined;
    department_id?: string | number | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
  }) {
    // where cho bảng timekeepings
    const whereTK: any = {};
    // include cho bảng employees (+ department)
    const includeEmp: any = {
      model: db.Employee,
      as: "employee",
      attributes: ["employee_id", "full_name", "email", "department_id"],
      where: { deleted: "0" },
      include: [
        {
          model: db.Department,
          as: "department",
          attributes: ["id", "code", "value"],
        },
      ],
    };

    // lọc theo employee_id (chứa chuỗi nhập vào)
    if (filters.employee_id) {
      includeEmp.where.employee_id = { [Op.like]: `%${filters.employee_id}%` };
      // nếu muốn "bắt đầu bằng": `${filters.employee_id}%`
    }

    // lọc theo department
    if (filters.department_id) {
      includeEmp.where.department_id = Number(filters.department_id);
    }

    // lọc theo khoảng ngày (work_date)
    if (filters.date_from && filters.date_to) {
      whereTK.work_date = { [Op.between]: [filters.date_from, filters.date_to] };
    } else if (filters.date_from) {
      whereTK.work_date = { [Op.gte]: filters.date_from };
    } else if (filters.date_to) {
      whereTK.work_date = { [Op.lte]: filters.date_to };
    }

    const rows = await db.Timekeeping.findAll({
      where: whereTK,
      attributes: [
        "id",
        ["work_date", "date"], // alias FE dễ đọc r.date
        "check_in",
        "check_out",
        "total_hours",
        "status",
        "employee_id",
      ],
      include: [includeEmp],
      order: [["work_date", "DESC"]],
    });

    return { err: 0, data: rows };
  }

  /**
   * Lấy tất cả bản ghi chấm công (không filter)
   */
  public getAllTimekeeping = async () => {
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
            include: [
              { model: db.Department, as: "department", attributes: ["id", "code", "value"] },
            ],
          },
        ],
        order: [["work_date", "DESC"]],
      });

      return { err: 0, mes: "Get timekeeping successfully", data: response };
    } catch (error) {
      throw error;
    }
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
