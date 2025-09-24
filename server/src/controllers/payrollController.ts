// controllers/payrollController.ts
"use strict";

import { Request, Response } from "express";
import payrollService from "../services/payrollService"; // import INSTANCE

class PayrollController {
  // role_1: xem tất cả (có thể lọc theo department_id, month)
  // role_3: nếu gọi vào đây cũng vẫn được vì service sẽ tự chặn/giới hạn
  public getAll = async (req: Request, res: Response) => {
  try {
    const { month, department_id, employee_id } = req.query;
    const filters: { month?: string; department_id?: number; employee_id?: string } = {};
    if (typeof month === "string") filters.month = month;
    if (typeof department_id === "string" && department_id !== "") {
      const dep = Number(department_id);
      if (!Number.isNaN(dep)) filters.department_id = dep;
    }
    if (typeof employee_id === "string" && employee_id.trim()) {
      filters.employee_id = employee_id.trim();  // 🔎 truyền xuống service
    }

    const result = await payrollService.getAllPayrolls((req as any).user, filters);
    const status = result.err === 0 ? 200 : result.mes === "Forbidden" ? 403 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("getAll error:", e);
    return res.status(500).json({ err: 1, mes: "Internal server error" });
  }
};

  // role_2,3: endpoint riêng (FE không gửi department_id/employee_id)
  public getMine = async (req: Request, res: Response) => {
    try {
      const { month } = req.query;
      const filters: { month?: string } = {};
      if (typeof month === "string") filters.month = month;

      const result = await payrollService.getAllPayrolls((req as any).user, filters as any);
      const status = result.err === 0 ? 200 : result.mes === "Forbidden" ? 403 : 404;
      return res.status(status).json(result);
    } catch (e) {
      console.error("getMine error:", e);
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };
}

export default new PayrollController();
