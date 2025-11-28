import NotificationService from "../services/notificationService";
import { Request, Response } from "express";

class NotificationController {
  public getNotifications = async (req: Request, res: Response) => {
    try {
      const reqUser = (req as any).user; // ✅ lấy thông tin user từ middleware auth
      const response = await NotificationService.getNotifications(reqUser, 20);
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
