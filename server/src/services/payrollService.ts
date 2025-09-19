"use strict";

import db from "../models";  // Đảm bảo import đúng mô hình Sequelize
import { Op } from "sequelize";

class PayrollService {
  // Lấy bảng lương chi tiết của tất cả nhân viên theo tháng, phòng ban, hoặc nhân viên
  public getAllPayrolls = async (filters: {
    month?: string;
    department_id?: number;
    employee_id?: string;
  }) => {
    try {
      const payrolls = await db.PayrollPayslipLine.findAll({
        where: {
          ...(filters.month && { month: filters.month }),  // Lọc theo tháng nếu có
          ...(filters.department_id && { "$employee.department_id$": filters.department_id }),  // Lọc theo phòng ban nếu có
          ...(filters.employee_id && { employee_id: filters.employee_id }),  // Lọc theo nhân viên nếu có
        },
        include: [
          {
            model: db.Employee,  // Liên kết với bảng Employee
            as: "employee",  // Alias đã định nghĩa trong mô hình Employee
            attributes: ["employee_id", "full_name", "basic_salary"],  // Các thuộc tính cần lấy từ bảng Employee
            include: [
              {
                model: db.Department,  // Liên kết với bảng Department để lấy thông tin phòng ban
                as: "department",  // Alias đã định nghĩa trong Employee
                attributes: ["value"],  // Lấy tên phòng ban
              },
              {
                model: db.Position,  // Liên kết với bảng Position để lấy thông tin vị trí
                as: "position",  // Alias đã định nghĩa trong Employee
                attributes: ["value"],  // Lấy tên vị trí
              },
            ],
          },
        ],
        order: [["employee_id", "ASC"]],  // Sắp xếp theo employee_id và loại khoản (basic_salary, allowance, etc.)
      });

      return {
        err: payrolls.length > 0 ? 0 : 1,
        mes: payrolls.length > 0 ? "Get payrolls successfully" : "No payrolls found",
        data: payrolls,
      };
    } catch (error) {
      console.error("Error in getAllPayrolls:", error);
      throw error;
    }
  };
}

export default new PayrollService();
