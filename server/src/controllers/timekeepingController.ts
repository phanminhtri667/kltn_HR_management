import { Request, Response } from "express";
import db from "../models";

export const clockIn = async (req: Request, res: Response) => {
  const userId = req.user?.id;  // Lấy user id từ JWT

  const today = new Date().toISOString().split('T')[0];
  const existed = await db.Timekeeping.findOne({ where: { userId, date: today } });

  if (existed?.clockInAt) return res.status(400).json({ message: "Đã chấm công vào hôm nay" });

  const newEntry = await db.Timekeeping.upsert({
    userId,
    date: today,
    clockInAt: new Date(),
  });

  res.status(200).json({ message: "Chấm công vào thành công", data: newEntry });
};


export const clockOut = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  const entry = await db.Timekeeping.findOne({ where: { userId, date: today } });
  if (!entry || !entry.clockInAt) return res.status(400).json({ message: "Chưa chấm công vào" });

  entry.clockOutAt = new Date();
  await entry.save();

  res.status(200).json({ message: "Chấm công ra thành công", data: entry });
};

export const getMyTimekeeping = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const records = await db.Timekeeping.findAll({ where: { userId }, order: [['date', 'DESC']] });
  res.status(200).json({ data: records });
};
