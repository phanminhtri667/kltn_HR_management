"use strict";

import { Request, Response } from "express";
import TimekeepingService from "../services/timekeepingService"; // Import service của Timekeeping

class TimekeepingController {
  // role_1: xem tất cả (có thể lọc theo department_id, employee_id, date_from, date_to)
  // role_3: nếu gọi vào đây cũng vẫn được vì service sẽ tự chặn/giới hạn
  public getAll = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, employee_id, department_id } = req.query;
    const filters: { date_from?: string; date_to?: string; employee_id?: string; department_id?: number } = {};

    if (typeof date_from === "string") filters.date_from = date_from;
    if (typeof date_to === "string") filters.date_to = date_to;
    if (typeof employee_id === "string" && employee_id.trim()) filters.employee_id = employee_id.trim();
    if (typeof department_id === "string" && department_id.trim()) filters.department_id = Number(department_id);

    // ⚠️ Không cần set department_id hoặc employee_id ở đây nữa,
    // vì service đã xử lý quyền dựa trên role_code và department_id
    const result = await TimekeepingService.getAllTimekeeping((req as any).user, filters);

    const status = result.err === 0 ? 200 : result.mes === "Forbidden" ? 403 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("getAll error:", e);
    return res.status(500).json({ err: 1, mes: "Internal server error" });
  }
};


  // role_2, role_3: chỉ xem dữ liệu của chính mình hoặc phòng ban của mình
  // FE không cần gửi department_id hay employee_id, sẽ được tự động xử lý trong service
  public getMine = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;
    const filters: { date_from?: string; date_to?: string } = {};

    if (typeof date_from === "string") filters.date_from = date_from;
    if (typeof date_to === "string") filters.date_to = date_to;

    // Gọi service để lấy dữ liệu timekeeping cho chính nhân viên hoặc phòng ban của họ
    const result = await TimekeepingService.getAllTimekeeping((req as any).user, filters);
    const status = result.err === 0 ? 200 : result.mes === "Forbidden" ? 403 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("getMine error:", e);
    return res.status(500).json({ err: 1, mes: "Internal server error" });
  }
};

  // Lấy chấm công theo phòng ban (role_1 và role_2 mới có thể gọi)
  public getByDepartment = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.departmentId);
      if (Number.isNaN(id)) {
        return res.status(400).json({ err: 1, mes: "Invalid departmentId" });
      }

      const result = await TimekeepingService.getByDepartment(id);
      const status = result.err === 0 ? 200 : 404;
      return res.status(status).json(result);
    } catch (e) {
      console.error("getByDepartment error:", e);
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };

  // Nhân viên check-in (tạo bản ghi mới)
  public create = async (req: Request, res: Response) => {
    try {
      const { employee_id, work_date, check_in } = req.body || {};
      if (!employee_id || !work_date) {
        return res.status(400).json({ err: 1, mes: "employee_id and work_date are required" });
      }

      const response = await TimekeepingService.createTimekeeping(req.body);
      return res.status(201).json(response);
    } catch (e) {
      console.error("create error:", e);
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };

  // Nhân viên check-out (cập nhật checkout + status)
  public checkout = async (req: Request, res: Response) => {
    try {
      const { employee_id, work_date, check_out } = req.body || {};
      if (!employee_id || !work_date || !check_out) {
        return res.status(400).json({ err: 1, mes: "employee_id, work_date, and check_out are required" });
      }

      const response = await TimekeepingService.updateCheckout(
        String(employee_id),
        String(work_date),
        new Date(check_out) // đảm bảo kiểu Date
      );

      return res.status(200).json(response);
    } catch (e) {
      console.error("checkout error:", e);
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };
}

export default new TimekeepingController();
