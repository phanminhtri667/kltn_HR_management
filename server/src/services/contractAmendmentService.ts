"use strict";
import db from "../models";
import { Transaction } from "sequelize";
import { ReqUser, isAdmin, isManager, isEmployee } from '../utils/Authz';

class ContractAmendmentService {
  // Admin tạo phụ lục; Manager có thể "đề xuất" (ở đây cho phép Admin thôi)
  public async create(reqUser: ReqUser, payload: { contract_id:number; amend_type:'salary_change'|'title_change'|'term_extension'|'other'; details_json:any; effective_date:string; approved_by?:number|null }) {
    if (!isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    return await db.sequelize.transaction(async (t:Transaction) => {
      const c = await db.EmploymentContract.findByPk(payload.contract_id, { transaction:t });
      if (!c) return { err:1, mes:"Contract not found" };
      if (!["active","amended"].includes(c.status)) return { err:1, mes:"Amendment only when contract is active" };

      const am = await db.ContractAmendment.create({
        ...payload, approved_by: payload.approved_by ?? (reqUser as any)?.id ?? null
      }, { transaction:t });
      await db.ContractAudit.create({ contract_id: payload.contract_id, action:"add_amendment", by_user:(reqUser as any)?.id ?? null, meta: payload }, { transaction:t });
      return { err:0, data: am };
    });
  }

  // Cron/manual áp dụng phụ lục đến hạn (Admin trigger cron)
  public async applyDue(reqUser?: ReqUser) {
    if (reqUser && !isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    const today = new Date().toISOString().slice(0,10);
    const due = await db.ContractAmendment.findAll({ where:{ effective_date: { [("le" as any)]: today } }});
    let applied = 0;

    for (const a of due) {
      await db.sequelize.transaction(async (t:Transaction) => {
        const c = await db.EmploymentContract.findByPk(a.contract_id, { transaction:t, lock:t.LOCK.UPDATE });
        if (!c) return;
        if (!["active","amended"].includes(c.status)) return;

        if (a.amend_type === "salary_change") {
          const old = c.base_salary;
          const next = a.details_json?.new_salary ?? old;
          await c.update({ base_salary: next, status:"amended" }, { transaction:t });
          await db.ContractAudit.create({ contract_id:c.id, action:"apply_amend_salary", meta:{ old, next, amendment_id:a.id } }, { transaction:t });

          // Ghi vào payroll_changes (không bắt buộc payroll_id)
          await db.PayrollChange.create({
            payroll_id: null,
            change_type: "data",
            old_data: { base_salary: String(old) },
            new_data: { base_salary: String(next) },
            description: `Applied amendment #${a.id}`
          }, { transaction:t });
          applied++;
        }

        if (a.amend_type === "term_extension") {
          const nextEnd = a.details_json?.new_end_date;
          if (nextEnd) {
            await c.update({ end_date: nextEnd, status:"amended" }, { transaction:t });
            await db.ContractAudit.create({ contract_id:c.id, action:"apply_amend_term", meta:{ new_end_date: nextEnd, amendment_id:a.id } }, { transaction:t });
            applied++;
          }
        }

        if (a.amend_type === "title_change") {
          const nextTitle = a.details_json?.new_title ?? c.job_title;
          await c.update({ job_title: nextTitle, status:"amended" }, { transaction:t });
          await db.ContractAudit.create({ contract_id:c.id, action:"apply_amend_title", meta:{ new_title: nextTitle, amendment_id:a.id } }, { transaction:t });
          applied++;
        }

        // Sau khi apply xong có thể đưa về active ngay:
        await c.update({ status:"active" }, { transaction:t });
      });
    }
    return { err:0, mes:`Applied ${applied} amendment(s)` };
  }
}
export default new ContractAmendmentService();
