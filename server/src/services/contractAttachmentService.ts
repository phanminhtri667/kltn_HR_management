"use strict";
import db from "../models";
import { Transaction } from "sequelize";
import { ReqUser, isAdmin, isManager, isEmployee } from '../utils/Authz';

class ContractAttachmentService {
  // Manager & Admin có thể upload; Employee chỉ tải file
  public async add(reqUser: ReqUser, contract_id:number, payload:{ file_path:string; file_type?:string; notes?:string }) {
    if (!isAdmin(reqUser) && !isManager(reqUser)) return { err:1, mes:"Forbidden" };
    try {
      const row = await db.ContractAttachment.create({ contract_id, ...payload, uploaded_by:(reqUser as any)?.id ?? null });
      await db.ContractAudit.create({ contract_id, action:"add_attachment", by_user:(reqUser as any)?.id ?? null, meta: payload });
      return { err:0, data: row };
    } catch (e:any) {
      return { err:1, mes:"Add attachment failed (maybe duplicate path)" };
    }
  }

  public async list(reqUser: ReqUser, contract_id:number) {
    // Employee chỉ xem nếu là HĐ của mình
    if (isEmployee(reqUser)) {
      const ec = await db.EmploymentContract.findByPk(contract_id);
      if (!ec) return { err:1, mes:"Not found" };
      const me = await db.Employee.findOne({ where:{ email:reqUser.email }, attributes:["employee_id"] });
      if (!me || me.employee_id !== ec.employee_id) return { err:1, mes:"Forbidden" };
    }
    const rows = await db.ContractAttachment.findAll({ where:{ contract_id }, order:[["uploaded_at","DESC"]]});
    return { err:0, data: rows };
  }
}
export default new ContractAttachmentService();
