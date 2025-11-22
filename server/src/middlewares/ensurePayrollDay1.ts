"use strict";

import { Request, Response, NextFunction } from "express";
import moment from "moment-timezone";
import payrollService from "../services/payrollService";

// In-memory lock để tránh nhiều request cùng ensure 1 tháng trong cùng process
const ensureLocks = new Map<string, Promise<any>>();

export default async function ensurePayrollDay1(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const role = user?.role_code;

    // Chỉ role_1 / role_2 mới trigger ensure
    if (!role || (role !== "role_1" && role !== "role_2")) {
      return next();
    }

    // Chỉ chạy trong NGÀY 1 theo múi giờ VN
    const now = moment().tz("Asia/Ho_Chi_Minh");
    if (now.date() !== 1) {
      return next();
    }

    // Tháng mục tiêu là THÁNG TRƯỚC (YYYY-MM)
    const targetMonth = now.clone().subtract(1, "month").format("YYYY-MM");

    // Nếu đã có 1 ensure đang chạy cho tháng này -> đợi nó
    let lock = ensureLocks.get(targetMonth);
    if (!lock) {
      lock = (async () => {
        try {
          console.log(`[ensurePayrollDay1] Starting payroll creation for month: ${targetMonth}`);

          const r = await payrollService.ensurePayrollForMonthAllEmployees(targetMonth);
          console.log(`[ensurePayrollDay1] ${r.mes}`);
        } catch (err) {
          console.error("[ensurePayrollDay1] ensure failed:", err);
        }
      })();

      ensureLocks.set(targetMonth, lock);
      lock.finally(() => {
        ensureLocks.delete(targetMonth);
        console.log(`[ensurePayrollDay1] Lock for month ${targetMonth} released.`);
      });
    } else {
      console.log(`[ensurePayrollDay1] Payroll creation for month ${targetMonth} is already in progress. Waiting...`);
    }

    // Đợi quá trình ensure hoàn tất (idempotent)
    await lock; 
    return next();
  } catch (err) {
    console.error("[ensurePayrollDay1] error:", err);
    return next(); // không chặn request nếu lỗi
  }
}
