import { Request, Response } from "express";
import db from "../models";
import { isAdmin, isManager } from "../utils/Authz";

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ err: 1, message: "Not authenticated" });

    // Vì LeaveRequest.userId là INT → chỉ nhận đăng nhập loại "user" có id số
    if (user.id == null) {
      return res.status(400).json({ err: 1, message: "This account type cannot create leave request (missing numeric user id)" });
    }

    const { type, startDate, endDate, reason } = req.body;

    const newRequest = await db.LeaveRequest.create({
      userId: user.id,       // INT
      type,
      startDate,
      endDate,
      reason,
      status: "PENDING",
    });

    return res.status(201).json({ err: 0, message: "Gửi đơn nghỉ thành công", data: newRequest });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ err: -1, message: "Internal server error" });
  }
};

export const getMyLeaveRequests = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ err: 1, message: "Not authenticated" });

    if (user.id == null) {
      return res.status(400).json({ err: 1, message: "This account type cannot query personal leave requests" });
    }

    const requests = await db.LeaveRequest.findAll({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ err: 0, data: requests });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ err: -1, message: "Internal server error" });
  }
};

export const getAllLeaveRequests = async (_req: Request, res: Response) => {
  try {
    const requests = await db.LeaveRequest.findAll({ include: db.User });
    return res.status(200).json({ err: 0, data: requests });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ err: -1, message: "Internal server error" });
  }
};

export const approveLeaveRequest = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ err: 1, message: "Not authenticated" });

    // Duyệt = admin hoặc manager
    if (!isAdmin(user) && !isManager(user)) {
      return res.status(403).json({ err: 1, message: "Không đủ quyền truy cập" });
    }

    const leaveRequest = await db.LeaveRequest.findByPk(req.params.id);
    if (!leaveRequest) return res.status(404).json({ err: 1, message: "Không tìm thấy đơn nghỉ" });

    leaveRequest.status = "APPROVED";
    await leaveRequest.save();

    return res.status(200).json({ err: 0, message: "Đã duyệt đơn nghỉ phép" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ err: -1, message: "Internal server error" });
  }
};

export const rejectLeaveRequest = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ err: 1, message: "Not authenticated" });

    if (!isAdmin(user) && !isManager(user)) {
      return res.status(403).json({ err: 1, message: "Không đủ quyền truy cập" });
    }

    const request = await db.LeaveRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ err: 1, message: "Không tìm thấy đơn nghỉ" });

    request.status = "REJECTED";
    await request.save();

    return res.status(200).json({ err: 0, message: "Đã từ chối đơn nghỉ" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ err: -1, message: "Internal server error" });
  }
};
