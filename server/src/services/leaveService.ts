import db from "../models";
import { Op } from "sequelize";
import cron from "node-cron";

class LeaveService {
  // ===== Tạo đơn nghỉ phép =====
  public async createLeaveRequest(data: any) {
    try {
      const { employee_id, department_id, type_id, start_date, end_date, reason } = data;

      // Kiểm tra loại nghỉ hợp lệ
      const leaveType = await db.LeaveType.findByPk(type_id);
      if (!leaveType) {
        return { err: 1, mes: "Loại nghỉ phép không hợp lệ" };
      }

      // Kiểm tra trùng ngày
      const overlap = await db.LeaveRequest.findOne({
        where: {
          employee_id,
          status: { [Op.in]: ["PENDING", "APPROVED"] },
          [Op.or]: [
            { start_date: { [Op.between]: [start_date, end_date] } },
            { end_date: { [Op.between]: [start_date, end_date] } },
            {
              [Op.and]: [
                { start_date: { [Op.lte]: start_date } },
                { end_date: { [Op.gte]: end_date } },
              ],
            },
          ],
        },
      });

      if (overlap) {
        return { err: 1, mes: "Khoảng ngày này đã có đơn nghỉ khác đang chờ duyệt hoặc đã duyệt." };
      }

      const leave = await db.LeaveRequest.create({
        employee_id,
        department_id,
        type_id,
        start_date,
        end_date,
        reason,
        status: "PENDING",
      });

      return { err: 0, mes: "Tạo đơn nghỉ thành công", data: leave };
    } catch (error) {
      console.error("createLeaveRequest error:", error);
      return { err: -1, mes: "Internal server error" };
    }
  }

  // ===== Lấy danh sách đơn nghỉ của 1 nhân viên =====
  public async getLeavesByEmployee(employee_id: string) {
    try {
      const leaves = await db.LeaveRequest.findAll({
        where: { employee_id },
        include: [{ model: db.LeaveType, as: "leave_type" }],
        order: [["created_at", "DESC"]],
      });
      return { err: 0, data: leaves };
    } catch (error) {
      console.error("getLeavesByEmployee error:", error);
      return { err: -1, mes: "Internal server error" };
    }
  }

  // ===== Lấy tất cả đơn nghỉ (Admin/Leader) =====
  public async getAllLeaves(filters: any = {}) {
    try {
      const where: any = {};
      if (filters.department_id) where.department_id = filters.department_id;
      if (filters.status) where.status = filters.status;

      const leaves = await db.LeaveRequest.findAll({
        where,
        include: [
          {
            model: db.Employee,
            as: "employee",
            attributes: ["employee_id", "full_name"],
            include: [
              {
                model: db.Department,
                as: "department",
                attributes: ["id", "value"], // value là tên phòng ban
              },
            ],
          },
          { model: db.LeaveType, as: "leave_type" },
        ],
        order: [["created_at", "DESC"]],
      });
      
      return { err: 0, data: leaves };
    } catch (error) {
      console.error("getAllLeaves error:", error);
      return { err: -1, mes: "Internal server error" };
    }
  }

  // ===== Duyệt đơn =====
  public async approveLeave(id: number, approver_id: string) {
    try {
      const leave = await db.LeaveRequest.findByPk(id);
      if (!leave) return { err: 1, mes: "Không tìm thấy đơn nghỉ" };

      await leave.update({
        status: "APPROVED",
        approver_id,
        approved_at: new Date(),
      });

      return { err: 0, mes: "Duyệt đơn nghỉ thành công", data: leave };
    } catch (error) {
      console.error("approveLeave error:", error);
      return { err: -1, mes: "Internal server error" };
    }
  }

  // ===== Từ chối đơn =====
  public async rejectLeave(id: number, approver_id: string, reject_reason: string) {
    try {
      const leave = await db.LeaveRequest.findByPk(id);
      if (!leave) return { err: 1, mes: "Không tìm thấy đơn nghỉ" };

      await leave.update({
        status: "REJECTED",
        approver_id,
        rejected_at: new Date(),
        reject_reason,
      });

      return { err: 0, mes: "Từ chối đơn nghỉ thành công", data: leave };
    } catch (error) {
      console.error("rejectLeave error:", error);
      return { err: -1, mes: "Internal server error" };
    }
  }

  // ===== Huỷ đơn =====
  public async cancelLeave(id: number) {
    try {
      const leave = await db.LeaveRequest.findByPk(id);
      if (!leave) return { err: 1, mes: "Không tìm thấy đơn nghỉ" };

      if (leave.status === "APPROVED" || leave.status === "PENDING") {
        await leave.update({ status: "CANCELLED" });
        return { err: 0, mes: "Huỷ đơn nghỉ thành công" };
      }
      return { err: 1, mes: "Chỉ có thể huỷ đơn đang chờ duyệt hoặc đã duyệt" };
    } catch (error) {
      console.error("cancelLeave error:", error);
      return { err: -1, mes: "Internal server error" };
    }
  }
}
// === AUTO-REJECT LEAVE REQUESTS ===
// Chạy mỗi ngày lúc 17:00 (giờ server)
// === AUTO-REJECT LEAVE REQUESTS ===
cron.schedule("0 17 * * *", async () => {
  try {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    console.log(`⏰ Auto reject job running at ${now.toLocaleString()}`);

    const pendingLeaves = await db.LeaveRequest.findAll({
      where: {
        status: "PENDING",
        start_date: tomorrowStr,
      },
    });

    for (const leave of pendingLeaves) {
      await leave.update({
        status: "REJECTED",
        reject_reason: "Tự động từ chối do không được duyệt trước 17h hôm trước",
        rejected_at: new Date(),
      });
      console.log(`❌ Auto rejected leave id=${leave.id} for ${leave.employee_id}`);
    }

    console.log(`✅ Auto-reject job done, ${pendingLeaves.length} đơn bị từ chối.`);
  } catch (error) {
    console.error("Auto-reject job error:", error);
  }
});

export default new LeaveService();
