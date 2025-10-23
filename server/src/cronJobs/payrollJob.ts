import cron from "node-cron";
import moment from "moment-timezone";
import payrollService from "../services/payrollService";

console.log("[payrollJob] module loaded …");

/**cron.schedule("* * * * *", */
cron.schedule("59 59 23 28-31 * *", // sec min hour day-of-month month day-of-week
  async () => {
    try {
      const now = moment().tz("Asia/Ho_Chi_Minh");
      const isForce = process.env.TEST_FORCE_CRON === "true";
      const lastDay = now.clone().endOf("month").date();

      // chỉ chạy đúng ngày cuối tháng (trừ khi bật force)
      if (!isForce && now.date() !== lastDay) return;

      // tháng mục tiêu: tháng hiện tại (đang kết thúc) hoặc ép bằng ENV khi test
      const targetMonth = process.env.TEST_TARGET_MONTH || now.format("YYYY-MM");

      console.log(`[payrollJob] ${now.format()} -> ensure month=${targetMonth}`);
      const r = await payrollService.ensurePayrollForMonthAllEmployees(targetMonth);
      console.log(`[payrollJob] ${r.mes}`);
    } catch (err) {
      console.error("[payrollJob] failed:", err);
    }
  },
  { timezone: "Asia/Ho_Chi_Minh" }
);
// Cron job để duyệt bảng lương của tháng trước vào ngày 6 của tháng sau
cron.schedule("0 0 6 * *", // Chạy vào lúc 00:00 ngày 6 mỗi tháng
  async () => {
    try {
      const now = moment().tz("Asia/Ho_Chi_Minh");
      const lastMonth = now.clone().subtract(1, "month").format("YYYY-MM");  // Lấy tháng trước

      console.log(`[payrollJob] ${now.format()} -> changing status of payrolls for ${lastMonth}`);
      const result = await payrollService.autoApprovePayrollsForPreviousMonth(); // Gọi service để duyệt bảng lương
      console.log(`[payrollJob] ${result.mes}`);
    } catch (err) {
      console.error("[payrollJob] failed:", err);
    }
  },
  { timezone: "Asia/Ho_Chi_Minh" } // Múi giờ
);