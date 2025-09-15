import { Request, Response } from "express";
import WorkingHoursService from "../services/workingHoursService";

class WorkingHoursController {
  public getConfig = async (req: Request, res: Response) => {
    try {
      const response = await WorkingHoursService.getConfig();
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in getConfig:", error);
      res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  public updateConfig = async (req: Request, res: Response) => {
    try {
      const response = await WorkingHoursService.updateConfig(req.body);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in updateConfig:", error);
      res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };
}

export default new WorkingHoursController();
