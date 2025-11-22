"use strict";

import db from "../models";
import { Op } from "sequelize";

/**
 * 🧭 NotificationService
 * Quản lý toàn bộ thao tác với bảng `notifications`
 *  - Gửi thông báo cho User hoặc Employee
 *  - Lấy danh sách thông báo theo người dùng
 *  - Đánh dấu đã đọc, xóa mềm, v.v.
 */
class NotificationService {
  
  /* =========================================================
 * 🔹 Lấy danh sách thông báo của người đang đăng nhập
 * ========================================================= */
public async getNotifications(reqUser: any, limit: number = 20) {
  try {
    // Tạo điều kiện lọc cơ bản
    const whereClause: any = { deleted: false };

    // 🔸 Nếu là nhân viên (có employee_id)
    if (reqUser.employee_id) {
      whereClause.employee_id = reqUser.employee_id;
    }
    // 🔸 Nếu là user hệ thống (có id)
    else if (reqUser.id) {
      whereClause.user_id = reqUser.id;
    }

    // 🔸 Lấy thông báo theo người dùng, mới nhất trước
    const notifications = await db.Notification.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
    });

    return {
      err: 0,
      mes: "Success",
      data: notifications,
    };
  } catch (error) {
    console.error("❌ Error in getNotifications:", error);
    return { err: 1, mes: "Internal Server Error" };
  }
}


  /* =========================================================
   * 🔹 2) Tạo thông báo mới
   * ========================================================= */
  public async createNotification({
    employee_id = null,
    user_id = null,
    message,
    type = "general",
    link = null,
  }: {
    employee_id?: string | null;
    user_id?: number | null;
    message: string;
    type?: string;
    link?: string | null;
  }) {
    try {
      if (!message) throw new Error("Message is required");

      const notification = await db.Notification.create({
        employee_id,
        user_id,
        message,
        type,
        link,
        is_read: false,
        deleted: false,
      });

      return {
        err: 0,
        mes: "Notification created successfully",
        data: notification,
      };
    } catch (error) {
      console.error("❌ Error in createNotification:", error);
      return { err: 1, mes: "Failed to create notification" };
    }
  }

  /* =========================================================
   * 🔹 3) Đánh dấu thông báo đã đọc
   * ========================================================= */
  public async markAsRead(notificationId: number) {
    try {
      const notification = await db.Notification.findByPk(notificationId);
      if (!notification)
        return { err: 1, mes: "Notification not found" };

      notification.is_read = true;
      await notification.save();

      return {
        err: 0,
        mes: "Notification marked as read successfully",
      };
    } catch (error) {
      console.error("❌ Error in markAsRead:", error);
      return { err: 1, mes: "Failed to mark notification as read" };
    }
  }

  /* =========================================================
   * 🔹 4) Lấy thông báo mới nhất (cho dashboard)
   * ========================================================= */
  public async getRecentNotifications(limit: number = 5) {
    try {
      const notifications = await db.Notification.findAll({
        where: { deleted: false },
        order: [["createdAt", "DESC"]],
        limit,
      });

      return {
        err: 0,
        mes: "Success",
        data: notifications,
      };
    } catch (error) {
      console.error("❌ Error in getRecentNotifications:", error);
      return { err: 1, mes: "Failed to get notifications" };
    }
  }

  /* =========================================================
   * 🔹 5) Xóa mềm thông báo (đặt deleted = true)
   * ========================================================= */
  public async softDelete(notificationId: number) {
    try {
      const notification = await db.Notification.findByPk(notificationId);
      if (!notification)
        return { err: 1, mes: "Notification not found" };

      notification.deleted = true;
      await notification.save();

      return { err: 0, mes: "Notification deleted successfully" };
    } catch (error) {
      console.error("❌ Error in softDelete:", error);
      return { err: 1, mes: "Failed to delete notification" };
    }
  }
  // 🔹 Tạo thông báo khi tạo hợp đồng mới
  // =====================
  public async notifyContractCreation(reqUser: any, contract: any, legalEntity: any) {
    const notifications: any[] = [];

    // Nhân viên ký hợp đồng
    notifications.push({
      employee_id: contract.employee_id,
      message: `📄 Bạn vừa được tạo hợp đồng mới: ${contract.contract_code}`,
      type: "contract_create",
      link: `/contracts/${contract.id}`,
    });

    // Đại diện công ty
    if (legalEntity?.representative_user_id) {
      notifications.push({
        user_id: legalEntity.representative_user_id,
        message: `🧾 Hợp đồng ${contract.contract_code} vừa được tạo cho nhân viên ${contract.employee_id}`,
        type: "contract_create",
        link: `/contracts/${contract.id}`,
      });
    }

    // Người tạo hợp đồng
    if (reqUser.id) {
      notifications.push({
        user_id: reqUser.id,
        message: `✅ Bạn đã tạo thành công hợp đồng ${contract.contract_code}`,
        type: "contract_create",
        link: `/contracts/${contract.id}`,
      });
    } else if (reqUser.employee_id) {
      notifications.push({
        employee_id: reqUser.employee_id,
        message: `✅ Bạn đã tạo thành công hợp đồng ${contract.contract_code}`,
        type: "contract_create",
        link: `/contracts/${contract.id}`,
      });
    }

    for (const n of notifications) {
      await db.Notification.create(n);
    }
  }

  // =====================
  // 🔹 Gửi thông báo khi hợp đồng thay đổi trạng thái
  // =====================
  public async notifyContractStatusChange(contract: any, newStatus: string) {
    const msg = `Trạng thái hợp đồng ${contract.contract_code} đã được cập nhật thành: ${newStatus}`;
    await db.Notification.create({
      employee_id: contract.employee_id,
      message: msg,
      type: "contract_status_change",
      link: `/contracts/${contract.id}`,
    });
  }

  // =====================
  // 🔹 Gửi thông báo khi hợp đồng bị chấm dứt
  // =====================
  public async notifyContractTermination(contract: any) {
    const msg = `Hợp đồng ${contract.contract_code} của bạn đã bị chấm dứt.`;
    await db.Notification.create({
      employee_id: contract.employee_id,
      message: msg,
      type: "contract_terminate",
      link: `/contracts/${contract.id}`,
    });
  }
}
export default new NotificationService();
