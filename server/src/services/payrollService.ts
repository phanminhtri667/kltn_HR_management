"use strict";

import db from "../models";  // Đảm bảo import đúng mô hình Sequelize
import { Op } from "sequelize";

class PayrollService {
  // Lấy bảng lương chi tiết của tất cả nhân viên theo tháng, phòng ban, hoặc nhân viên
  public getAllPayrolls = async (
  reqUser: { email: string; role_code: string; department_id?: number | null },
  filters: { month?: string; department_id?: number; employee_id?: string }
) => {

  // ✅ role_2 & role_3: chỉ được xem của chính mình
  if (reqUser.role_code === "role_2" || reqUser.role_code === "role_3") {
    const emp = await db.Employee.findOne({
      where: { email: reqUser.email },   // hoặc user_id: reqUser.id
      attributes: ["employee_id"],
    });
    if (!emp) return { err: 0, data: [] };

    const where: any = { employee_id: emp.employee_id };
    if (filters.month) where.month = filters.month;

    const rows = await db.PayrollPayslipLine.findAll({
      where,
      include: [{
        model: db.Employee,
        as: "employee",
        attributes: ["employee_id", "full_name", "basic_salary", "department_id"],
        include: [
          { model: db.Department, as: "department", attributes: ["value"] },
          { model: db.Position,   as: "position",   attributes: ["value"] },
        ],
      }],
      order: [["employee_id", "ASC"]],
    });
    return { err: 0, data: rows };
  }

  // ✅ role_1: xem tất cả; hỗ trợ lọc department_id, month, employee_id
  if (reqUser.role_code === "role_1") {
    const where: any = {};
    if (filters.month) where.month = filters.month;
    if (filters.employee_id) where.employee_id = filters.employee_id; // 🔎 tìm theo mã nhân viên

    const includeEmp: any = {
      model: db.Employee,
      as: "employee",
      attributes: ["employee_id", "full_name", "basic_salary", "department_id"],
      include: [
        { model: db.Department, as: "department", attributes: ["value"] },
        { model: db.Position,   as: "position",   attributes: ["value"] },
      ],
    };
    if (filters.department_id) {
      includeEmp.where = { department_id: Number(filters.department_id) };
      includeEmp.required = true;
    }

    const rows = await db.PayrollPayslipLine.findAll({
      where,
      include: [includeEmp],
      order: [["employee_id", "ASC"]],
    });
    return { err: 0, data: rows };
  }

  return { err: 1, mes: "Forbidden" };
};
}

export default new PayrollService();
