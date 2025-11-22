import cron from "node-cron";
import { sendContractExpirationReminder } from "../services/employmentContractService"; // Import hàm từ contractService
import moment from "moment";

// Chạy job mỗi ngày lúc 8 giờ sáng
cron.schedule("0 10 * * *", async () => {
//cron.schedule("* * * * *", async () => {
  console.log(`🕗 Cron job chạy lúc: ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
  await sendContractExpirationReminder();  // Gọi hàm gửi thông báo hợp đồng sắp hết hạn
});
