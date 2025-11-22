"use strict";
import db from "../models";
import moment from "moment";

class ContractCronService {
  public async daily() {
    const today = moment().format("YYYY-MM-DD");

    // 1) signed -> active khi tới start_date
    await db.EmploymentContract.update(
      { status:"active", activated_at: new Date() },
      { where:{ status:"signed", start_date: { [("le" as any)]: today } } }
    );

    // 2) active/signed -> expired khi quá end_date
    await db.EmploymentContract.update(
      { status:"expired" },
      { where:{ status: ["active","signed"], end_date: { [("lt" as any)]: today } } }
    );

    // 3) (khuyến nghị) gửi notifications: sắp hết hạn HĐ (30/14/3 ngày), hết thử việc (14/7/3 ngày)
    // -> tuỳ bạn gọi NotificationService

    return { err:0, mes:"Contract daily cron executed" };
  }
}
export default new ContractCronService();
