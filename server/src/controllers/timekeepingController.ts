// src/controllers/timekeepingController.ts
import { Request, Response } from "express";
import TimekeepingService from "../services/timekeepingService";

class TimekeepingController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user; // từ verifyToken
      const { date_from, date_to, employee_id, department_id } = req.query as any;
      const result = await TimekeepingService.getAllTimekeeping(
        { email: user.email, role_code: user.role_code, department_id: user.department_id },
        { date_from, date_to, employee_id, department_id: department_id ? Number(department_id) : undefined }
      );
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };

  public getMine = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { date_from, date_to } = req.query as any;
      const result = await TimekeepingService.getAllTimekeeping(
        { email: user.email, role_code: user.role_code, department_id: user.department_id },
        { date_from, date_to }
      );
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };

  public getByDepartment = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const id = Number(req.params.departmentId);
      const result = await TimekeepingService.getByDepartment({ role_code: user.role_code }, id);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };

  // POST /api/timekeeping  (Check-in)
  public createCheckIn = async (req: Request, res: Response) => {
    try {
      const { employee_id, work_date, check_in } = req.body || {};
      if (!employee_id) return res.status(400).json({ err: 1, mes: "employee_id is required" });

      const result = await TimekeepingService.createTimekeeping({ employee_id, work_date, check_in });
      const statusCode = result.err === 0 ? 201 : 400;
      return res.status(statusCode).json(result);
    } catch (e) {
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };

  // PATCH /api/timekeeping/checkout  (Check-out)
  public checkout = async (req: Request, res: Response) => {
    try {
      const { employee_id, work_date, check_out } = req.body || {};
      console.log(">>> CHECKOUT BODY:", req.body);
      if (!employee_id || !work_date || !check_out) {
        console.log("❌ Missing input:", { employee_id, work_date, check_out });
        return res.status(400).json({ err: 1, mes: "Missing employee_id, work_date, or check_out" });
      }

      const result = await TimekeepingService.updateCheckout(
        String(employee_id),
        String(work_date || ""),
        check_out   
      );
      const statusCode = result.err === 0 ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (e) {
      console.error("❌ Checkout error:", e);
      return res.status(500).json({ err: 1, mes: "Internal server error" });
    }
  };
}

export default new TimekeepingController();
