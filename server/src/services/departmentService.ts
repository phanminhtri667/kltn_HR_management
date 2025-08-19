import db from "../models";
import NotificationService from "./notificationService";
class DepartmentService {
  public getAllDepartment = async () => {
    try {
      const response = await db.Department.findAll({
        where: {
          deleted: "0",
        },
        distinct: true,
      });
      console.log("response", response);

      return {
        err: response ? 0 : 1,
        mes: response ? "Get department successfully" : "error",
        data: response,
      };
    } catch (error) {
      throw error;
    }
  };
  public insertDepartment = async (data: any) => {
    try {
      const response = await db.Department.create(data);
      return {
        err: response ? 0 : 1,
        message: response
          ? `Created department successfully`
          : "Created department error",
        data: response,
      };
    } catch (error: any) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return {
          err: 1,
          message: "Department code already exists",
          data: null,
        };
      }
      throw error;
    }
  };
}

export default new DepartmentService();
