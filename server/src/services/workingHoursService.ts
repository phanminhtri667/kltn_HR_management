import db from "../models";

class WorkingHoursService {
  public getConfig = async () => {
    try {
      const config = await db.WorkingHours.findOne({ where: { id: 1 } });
      return {
        err: config ? 0 : 1,
        mes: config ? "Get working hours successfully" : "Not found",
        data: config,
      };
    } catch (error) {
      throw error;
    }
  };

  public updateConfig = async (data: any) => {
    try {
      const result = await db.WorkingHours.update(data, { where: { id: 1 } });
      return {
        err: result[0] ? 0 : 1,
        mes: result[0] ? "Update working hours successfully" : "Update failed",
      };
    } catch (error) {
      throw error;
    }
  };
}

export default new WorkingHoursService();
