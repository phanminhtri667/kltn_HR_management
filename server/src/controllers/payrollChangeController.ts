// controllers/payrollChangeController.ts
import { Request, Response } from "express";
import PayrollChangeService from "../services/payrollChangeService";

class PayrollChangeController {
  /**
   * GET /api/payroll-changes
   * Query:
   *  - month=YYYY-MM
   *  - employee_id=AD0001
   *  - department_id=1
   *  - limit=50
   * Cho phép: role_1 hoặc role_2 (nếu department_id = 1)
   */
  public getChanges = async (req: Request, res: Response) => {
    try {
      const user: any = req.user;
      if (!user) {
        return res.status(401).json({ err: 1, mes: "Unauthorized" });
      }

      // ✅ Cho phép Admin hoặc HR (role_2 thuộc phòng ban 1)
      const isHR = user.role_code === "role_2" && user.department_id === 1;
      const isAdmin = user.role_code === "role_1";

      if (!isAdmin && !isHR) {
        return res.status(403).json({ err: 1, mes: "Forbidden" });
      }

      const {
        month,
        employee_id,
        department_id,
        limit,
      } = req.query as {
        month?: string;
        employee_id?: string;
        department_id?: string;
        limit?: string;
      };

      const filters = {
        month: month || undefined,
        employee_id: employee_id || undefined,
        department_id: department_id ? Number(department_id) : undefined,
        limit: limit ? Number(limit) : undefined,
      };

      const result = await PayrollChangeService.list(filters);
      return res.status(200).json(result);
    } catch (error) {
      console.error("getChanges error:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };
}

export default new PayrollChangeController();
