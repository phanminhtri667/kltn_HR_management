import { Request, Response } from "express";
import TimekeepingService from "../services/timekeepingService";

class TimekeepingController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const response = await TimekeepingService.getAllTimekeeping();
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in getAll:", error);
      res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  public getByDepartment = async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const response = await TimekeepingService.getByDepartment(Number(departmentId)); // ép sang số
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in getByDepartment:", error);
      res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const response = await TimekeepingService.createTimekeeping(req.body);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in create:", error);
      res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  public checkout = async (req: Request, res: Response) => {
    try {
      const { employee_id, work_date, check_out } = req.body;
      const response = await TimekeepingService.updateCheckout(
        employee_id,
        work_date,
        check_out
      );
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in checkout:", error);
      res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };
}

export default new TimekeepingController();
