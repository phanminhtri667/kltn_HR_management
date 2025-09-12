import db from "../models";

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
   * Lấy tất cả bản ghi chấm công
   */
  public getAllTimekeeping = async () => {
    try {
      const response = await db.Timekeeping.findAll({
        include: [
          {
            model: db.Employee,
            attributes: ["employee_id", "full_name", "email", "department_id"],
            as: "employee",
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
   * Lấy chấm công theo phòng ban
   */
  public getByDepartment = async (departmentId: number) => {
    try {
      const response = await db.Timekeeping.findAll({
        include: [
          {
            model: db.Employee,
            attributes: ["employee_id", "full_name", "email", "department_id"],
            as: "employee",
            where: { department_id: departmentId, deleted: "0" },
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
