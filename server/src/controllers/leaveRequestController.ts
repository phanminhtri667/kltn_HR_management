import { Request, Response } from "express";
import db from "../models";

export const createLeaveRequest = async (req: Request, res: Response) => {
  const { type, startDate, endDate, reason } = req.body;
  const userId = req.user.id;

  const newRequest = await db.LeaveRequest.create({
    userId,
    type,
    startDate,
    endDate,
    reason,
    status: "PENDING",
  });

  res.status(201).json({ message: "Gửi đơn nghỉ thành công", data: newRequest });
};

export const getMyLeaveRequests = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const requests = await db.LeaveRequest.findAll({ where: { userId }, order: [["createdAt", "DESC"]] });
  res.status(200).json({ data: requests });
};

export const getAllLeaveRequests = async (req: Request, res: Response) => {
  const requests = await db.LeaveRequest.findAll({ include: db.User });
  res.status(200).json({ data: requests });
};

export const approveLeaveRequest = async (req: Request, res: Response) => {
  const id = req.params.id;
  const request = await db.LeaveRequest.findByPk(id);
  request.status = "APPROVED";
  await request.save();
  res.status(200).json({ message: "Đã duyệt đơn nghỉ" });
};

export const rejectLeaveRequest = async (req: Request, res: Response) => {
  const id = req.params.id;
  const request = await db.LeaveRequest.findByPk(id);
  request.status = "REJECTED";
  await request.save();
  res.status(200).json({ message: "Đã từ chối đơn nghỉ" });
};
