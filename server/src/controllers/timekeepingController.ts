import { Request, Response } from "express";
import TimekeepingService from "../services/timekeepingService";

class TimekeepingController {
  // Lọc theo employee_id / department_id / date range
  public async list(req: Request, res: Response) {
    try {
      // Lấy thông tin vai trò và phòng ban của người dùng từ token
      const userRole = req.user.role_code;  // Vai trò người dùng (role_1 hoặc role_2)
      const departmentId = req.user.department_id;  // ID phòng ban của người dùng

      // Các tham số lọc khác
      const employee_id =
        typeof req.query.employee_id === "string" && req.query.employee_id.trim()
          ? req.query.employee_id.trim()
          : undefined;

      const department_id =
        typeof req.query.department_id === "string" || typeof req.query.department_id === "number"
          ? Number(req.query.department_id)
          : undefined;

      const date_from =
        typeof req.query.date_from === "string" && req.query.date_from.trim()
          ? req.query.date_from.trim()
          : undefined;

      const date_to =
        typeof req.query.date_to === "string" && req.query.date_to.trim()
          ? req.query.date_to.trim()
          : undefined;

      // Nếu người dùng là admin, hiển thị tất cả nhân viên
      if (userRole === "role_1") {
        const result = await TimekeepingService.list({
          employee_id,
          department_id,
          date_from,
          date_to,
        });
        return res.status(200).json(result);
      }

      // Nếu người dùng là quản lý (role_2), chỉ hiển thị nhân viên của phòng ban người quản lý
      if (userRole === "role_2") {
        const result = await TimekeepingService.list({
          employee_id,
          department_id: departmentId,  // Lọc theo phòng ban của người quản lý
          date_from,
          date_to,
        });
        return res.status(200).json(result);
      }

      // Nếu vai trò không hợp lệ, trả về lỗi
      return res.status(403).json({ err: 1, mes: "Forbidden: Invalid role" });
      
    } catch (e) {
      console.error("Error in list:", e);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  }

  public getAll = async (_req: Request, res: Response) => {
    try {
      const response = await TimekeepingService.getAllTimekeeping();
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in getAll:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  public getByDepartment = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.departmentId);
      if (Number.isNaN(id)) {
        return res.status(400).json({ err: 1, mes: "Invalid departmentId" });
      }
      const response = await TimekeepingService.getByDepartment(id);
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in getByDepartment:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { employee_id, work_date } = req.body || {};
      if (!employee_id || !work_date) {
        return res.status(400).json({ err: 1, mes: "employee_id and work_date are required" });
      }
      const response = await TimekeepingService.createTimekeeping(req.body);
      return res.status(201).json(response);
    } catch (error) {
      console.error("Error in create:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  public checkout = async (req: Request, res: Response) => {
    try {
      const { employee_id, work_date, check_out } = req.body || {};
      if (!employee_id || !work_date || !check_out) {
        return res
          .status(400)
          .json({ err: 1, mes: "employee_id, work_date and check_out are required" });
      }

      const response = await TimekeepingService.updateCheckout(
        String(employee_id),
        String(work_date),
        new Date(check_out) // đảm bảo kiểu Date
      );

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in checkout:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };
}

export default new TimekeepingController();
