import db from "../models";
import Utils from "../utils/commonUtils";
import NotificationService from "./notificationService";
import { Op } from "sequelize";

class EmployeeService {
  public generateEmployeeId = async () => {
    const lastEmployee = await db.Employee.findOne({
      order: [["employee_id", "DESC"]],
      attributes: ["employee_id"],
    });
    if (lastEmployee) {
      let newEmployeeId = lastEmployee.dataValues.employee_id.toString().slice(2);
      return (
        "AD" + (Number(newEmployeeId) + 1).toString().padStart(4, "0")
      );
    }
    return "AD0001";
  };

  public getEmployeeIdSuggestions = async (keyword: string) => {
  try {
    const rows = await db.Employee.findAll({
      where: {
        deleted: "0",
        employee_id: { [Op.like]: `%${keyword}%` }, // chứa chuỗi gõ vào
      },
      attributes: ["employee_id"],
      group: ["employee_id"],   // distinct
      order: [["employee_id", "ASC"]],
      limit: 10,
    });
    return rows.map((r: any) => r.employee_id);
  } catch (error) {
    console.error("Error in getEmployeeIdSuggestions:", error);
    throw error;
  }
};
public getAllEmployee = async () => {
  try {
      const response = await db.Employee.findAll({
          where: { deleted: "0" },
          order: [["employee_id"]],
          include: [
              { model: db.Department, attributes: ["id", "code", "value"], as: "department" },
              { model: db.Position, attributes: ["id", "code", "value"], as: "position" },
          ],
      });

      return {
          err: response.length > 0 ? 0 : 1,
          mes: response.length > 0 ? "Get employees successfully" : "No employees found",
          data: response,
      };
  } catch (error) {
      console.error("Error in getAllEmployee:", error);
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

    // ✅ Gửi thông báo cho HR hoặc nhân viên mới
    await NotificationService.createNotification({
      message: `Created employee ${fullName} successfully`,
      employee_id: newEmployeeId,
      type: "employee_created",
      link: `/employees/${newEmployeeId}`,
    });

    return {
      err: 0,
      mes: `Created employee ${fullName} successfully`,
      data: response,
    };
  } catch (error) {
    console.error("Error in insertEmployee:", error);
    throw error;
  }
};

  public updateEmployee = async (employeeId: string, updatedData: any) => {
  try {
    const { employee_id, ...safeData } = updatedData; // tránh đổi khóa chính
    const [updated] = await db.Employee.update(safeData, { where: { employee_id: employeeId } });
    return { err: updated ? 0 : 1, mes: updated ? "Update successfully" : "Employee not found" };
  } catch (error: any) {
    console.error("Update employee failed:",
      error?.parent?.sqlMessage || error?.errors?.[0]?.message || error?.message
    );
    throw error;
  }
};


  public removeEmployee = async (employeeId: string) => {
    try {
      const [updated] = await db.Employee.update(
        { deleted: "1" },
        { where: { employee_id: employeeId } }
      );

      return {
        err: updated ? 0 : 1,
        mes: updated ? "Delete successfully" : "Employee not found",
      };
    } catch (error) {
      console.error("Error in removeEmployee:", error);
      throw error;
    }
  };

  // Lấy nhân viên theo phòng ban
  public getEmployeesByDepartment = async (reqUser: any) => {
  try {
    const whereClause: any = { deleted: "0" };

    // ✅ Nếu là Admin hoặc role_2 phòng HR thì xem tất cả
    if (reqUser.role_code === "role_1" || 
        (reqUser.role_code === "role_2" && reqUser.department_id === 1)) {
      // Không cần giới hạn phòng ban
    } 
    // ✅ Còn lại thì chỉ thấy nhân viên cùng phòng ban
    else if (reqUser.department_id) {
      whereClause.department_id = reqUser.department_id;
    }

    const employees = await db.Employee.findAll({
      where: whereClause,
      include: [
        { model: db.Department, attributes: ["id", "code", "value"], as: "department" },
        { model: db.Position, attributes: ["id", "code", "value"], as: "position" },
      ],
      order: [["employee_id", "ASC"]],
    });

    return { err: 0, data: employees };
  } catch (error) {
    console.error("Error in getEmployeesByDepartment:", error);
    return { err: -1, mes: "Internal server error" };
  }
};


}

export default new EmployeeService();
