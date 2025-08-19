import db from "../models";

class NotificationService {
  public getNotification = async () => {
    try {
      const response = await db.Notification.findAll({ limit: 10 });
      return {
        err: response ? 0 : 1,
        mes: response ? "Notification not found" : "error",
        data: response,
      };
    } catch (error) {
      throw error;
    }
  };

  public createNotification = (message: string) =>
    new Promise<any>(async (resolve, reject) => {
      try {
        const notification = await db.Notification.create({ message });
        resolve({
          err: 0,
          mes: "Notification created successfully",
          data: notification,
        });
      } catch (error) {
        reject(error);
      }
    });

  public markAsRead = (notificationId: number) =>
    new Promise<any>(async (resolve, reject) => {
      try {
        const notification = await db.Notification.findByPk(notificationId);
        if (notification) {
          notification.is_read = true;
          await notification.save();
          resolve({
            err: 0,
            mes: "Notification marked as read successfully",
          });
        } else {
          resolve({
            err: 1,
            mes: "Notification not found",
          });
        }
      } catch (error) {
        reject(error);
      }
    });

  public getRecentNotifications = (limit: number) =>
    new Promise<any>(async (resolve, reject) => {
      try {
        const notifications = await db.Notification.findAll({
          order: [["createdAt", "DESC"]],
          limit: limit,
        });
        resolve({
          err: 0,
          mes: "Success",
          data: notifications,
        });
      } catch (error) {
        reject(error);
      }
    });
}

export default new NotificationService();
