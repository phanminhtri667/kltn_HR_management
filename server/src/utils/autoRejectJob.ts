import cron from "node-cron";
import db from "../models";

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
      console.log(`❌ Auto rejected leave id=${leave.id} (${leave.employee_id})`);
    }

    console.log(`✅ Auto-reject job done: ${pendingLeaves.length} đơn bị từ chối.`);
  } catch (error) {
    console.error("❌ Auto-reject job error:", error);
  }
});
