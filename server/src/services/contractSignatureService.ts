"use strict";
import db from "../models";
import { Transaction } from "sequelize";
import { ReqUser, isAdmin, isManager, isEmployee } from '../utils/Authz';
import EmploymentContractService from './employmentContractService';

class ContractSignatureService {
  // Manager set danh sách người ký; Admin cũng có thể
  public async setSigners(reqUser: ReqUser, contract_id:number, signers: Array<{ signer_employee_id?:string; signer_name?:string; signer_role:'employee'|'hr'|'legal'|'manager'|'representative'; sign_order:number }>) {
    if (!isManager(reqUser) && !isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    return await db.sequelize.transaction(async (t:Transaction) => {
      const c = await db.EmploymentContract.findByPk(contract_id, { transaction: t });
      if (!c) return { err:1, mes:"Contract not found" };
      if (!["approved","sent_for_signing"].includes(c.status)) {
        return { err:1, mes:"Signers can be set only after approve (and before/during sending)" };
      }
      await db.ContractSignature.destroy({ where:{ contract_id }, transaction: t });
      await db.ContractSignature.bulkCreate(
        signers.map(s => ({ contract_id, ...s, sign_status:"pending" })), { transaction: t }
      );
      await db.ContractAudit.create({ contract_id, action:"set_signers", by_user:(reqUser as any)?.id ?? null, meta:{ signers } }, { transaction: t });
      return { err:0, mes:"Signers set" };
    });
  }

  // Employee ký (hoặc Admin ký hộ nếu cần – tuỳ policy, ở đây chỉ Employee)
  public async sign(reqUser: ReqUser, contract_id:number, my_order:number, evidence?:any) {
    if (!isEmployee(reqUser)) return { err:1, mes:"Forbidden" };

    return await db.sequelize.transaction(async (t:Transaction) => {
      // xác định employee_id của user
      const me = await db.Employee.findOne({ where:{ email:reqUser.email }, attributes:["employee_id"], transaction:t });
      if (!me) return { err:1, mes:"Employee profile not found" };

      const row = await db.ContractSignature.findOne({ where:{ contract_id, sign_order: my_order }, transaction:t, lock:t.LOCK.UPDATE });
      if (!row) return { err:1, mes:"Signer not found" };
      // chỉ cho ký nếu người ký là mình (nếu cấu hình signer_employee_id)
      if (row.signer_employee_id && row.signer_employee_id !== me.employee_id) return { err:1, mes:"Not your signing turn" };
      if (row.sign_status === "signed") return { err:0, mes:"Already signed" };

      // enforce thứ tự: mọi sign_order < my_order phải signed
      const pendingBefore = await db.ContractSignature.count({ where:{ contract_id, sign_order: { [("lt" as any)]: my_order }, sign_status: "pending" }, transaction:t });
      if (pendingBefore > 0) return { err:1, mes:"Previous signer has not signed yet" };

      await row.update({ sign_status:"signed", signed_at: new Date(), signature_evidence: evidence ?? null }, { transaction:t });
      await db.ContractAudit.create({ contract_id, action:"sign", by_user:(reqUser as any)?.id ?? null, meta:{ my_order } }, { transaction:t });

      // nếu tất cả đã ký -> đổi trạng thái hợp đồng
      await EmploymentContractService.markSignedIfAllSigned(contract_id, (reqUser as any)?.id ?? null);
      return { err:0, mes:"Signed" };
    });
  }
}
export default new ContractSignatureService();
