import NotificationService from "../services/notificationService";
import { Request, Response } from "express";

class NotificationController {
  public getNotification = async (req: Request, res: Response) => {
    try {
      const response = await NotificationService.getNotification();
      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        err: -1,
        mess: "Internal server error",
      });
    }
  };
}

export default new NotificationController();
