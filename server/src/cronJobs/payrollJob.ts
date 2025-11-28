import cron from "node-cron";
import moment from "moment-timezone";
import payrollService from "../services/payrollService";
import systemSettingService from "../services/systemSettingService";

console.log("[payrollJob] module loaded …");

/**
 * =============================================================
 *  CRON 1 — TẠO BẢNG LƯƠNG (Generate Payroll)
 *  FE có thể chỉnh ngày chạy tại: payroll_generate_day
 * =============================================================
 */
// CRON — Generate Payroll (for previous month)
cron.schedule("0 10 * * *", async () => {
  const now = moment().tz("Asia/Ho_Chi_Minh");
  
  const generateDayStr = await systemSettingService.get("payroll_generate_day");
  const generateDay = Number(generateDayStr || 1);

  if (now.date() !== generateDay) return;

  // tạo bảng lương THÁNG TRƯỚC
  const targetMonth = now.clone().subtract(1, "month").format("YYYY-MM");

  const result = await payrollService.ensurePayrollForMonthAllEmployees(targetMonth);
});



/**
 * =============================================================
 *  CRON 2 — DUYỆT BẢNG LƯƠNG (Approve Payroll)
 *  FE có thể chỉnh ngày chạy tại: payroll_auto_approve_day
 * =============================================================
 */
cron.schedule("0 10 * * *", async () => {
    try {
      const now = moment().tz("Asia/Ho_Chi_Minh");
      const isForce = process.env.TEST_FORCE_CRON === "true";

      // ⭐ Đọc ngày approve từ DB
      const approveDayStr = await systemSettingService.get("payroll_auto_approve_day");
      const approveDay = Number(approveDayStr || 6);

      if (!isForce && now.date() !== approveDay) return;

      const lastMonth = now.clone().subtract(1, "month").format("YYYY-MM");

      console.log(
        `[payrollApproveCron] ${now.format()} -> Approving payroll for ${lastMonth}`
      );

      const result = await payrollService.autoApprovePayrollsForPreviousMonth();

      console.log(`[payrollApproveCron] ${result.mes}`);
    } catch (err) {
      console.error("[payrollApproveCron] FAILED:", err);
    }
  },
  { timezone: "Asia/Ho_Chi_Minh" }
);
