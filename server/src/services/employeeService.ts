import db from "../models";
import Utils from "../utils/commonUtils";
import NotificationService from "./notificationService";
class EmployeeService {
  public generateEmployeeId = async () => {
    const lastEmployee = await db.Employee.findOne({
      order: [["employee_id", "DESC"]],
      attributes: ["employee_id"],
    });
    if (lastEmployee) {
      let newEmployeeId = lastEmployee.dataValues.employee_id
        .toString()
        .slice(2);
      return (newEmployeeId =
        "AD" + (Number(newEmployeeId) + 1).toString().padStart(4, "0"));
    }
    return "AD0001";
  };

  public getAllEmployee = async () => {
    try {
      const response = await db.Employee.findAll({
        where: {
          deleted: "0",
        },
        order: [["employee_id"]],
        // attributes:{
        //     exclude: ['position_id']
        // },
        include: [
          {
            model: db.Department,
            attributes: ["id", "code", "value"],
            as: "department",
          },
          {
            model: db.Position,
            attributes: ["id", "code", "value"],
            as: "position",
          },
        ],
        distinct: true,
        // nest: true,
        // skip: true,
        // raw: true,
      });

      return {
        err: response ? 0 : 1,
        mes: response ? "Employee not found" : "error",
        data: response,
      };
    } catch (error) {
      throw error;
    }
  };

  public insertEmployee = async (data: any) => {
    try {
      const newEmployeeId = await this.generateEmployeeId();
      const fullName = Utils.capitalizeFirstLetter(data.full_name);
      const partsName = fullName.split(" ");

      data.employee_id = newEmployeeId;
      data.full_name = fullName;
      data.first_name = partsName.pop();

      const response = await db.Employee.create(data);

      await NotificationService.createNotification(
        `Created employee ${fullName} successfully`
      );

      return {
        err: response ? 0 : 1,
        mes: response
          ? `Created employee ${fullName} successfully`
          : "Created employee error",
        data: response,
      };
    } catch (error) {
      throw error;
    }
  };

  public updateEmployee = async (employeeId: string, updatedData: any) => {
    try {
      const response = await db.Employee.update(updatedData, {
        where: {
          employee_id: employeeId,
        },
      });

      return {
        err: response[0] ? 0 : 1,
        mes: response[0] ? "Update successfully" : "Employee not found",
      };
    } catch (error) {
      throw error;
    }
  };

  public removeEmployee = async (employeeId: string) => {
    try {
      const response = await db.Employee.update(
        { deleted: "1" },
        {
          where: {
            employee_id: employeeId,
          },
        }
      );

      return {
        err: response[0] ? 0 : 1,
        mes: response[0] ? "Delete successfully" : "error",
      };
    } catch (error) {
      throw error;
    }
  };
}

export default new EmployeeService();
