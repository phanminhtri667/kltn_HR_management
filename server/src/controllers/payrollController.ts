"use strict";

import express from "express";
import PayrollService from "../services/payrollService";
import { Request, Response } from "express";

class PayrollController {
  // Lấy tất cả bảng lương của tất cả nhân viên với bộ lọc
  public getAllPayrolls = async (req: Request, res: Response) => {
    try {
      // Lấy các tham số từ query string
      const { month, department_id, employee_id } = req.query;

      const filters: { month?: string; department_id?: number; employee_id?: string } = {};

      // Lọc theo tháng nếu có
      if (month) filters.month = month as string;
      // Lọc theo phòng ban nếu có
      if (department_id) filters.department_id = parseInt(department_id as string);
      // Lọc theo nhân viên nếu có
      if (employee_id) filters.employee_id = employee_id as string;

      // Gọi service để lấy dữ liệu bảng lương chi tiết
      const result = await PayrollService.getAllPayrolls(filters);

      // Trả kết quả cho client
      return res.status(result.err === 0 ? 200 : 404).json(result);
    } catch (error) {
      // Xử lý lỗi
      console.error("Error in /payrolls:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}

export default new PayrollController();
