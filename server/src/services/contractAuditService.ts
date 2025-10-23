"use strict";
import db from "../models";
import { ReqUser, isAdmin, isManager, isEmployee } from '../utils/Authz';

class ContractAuditService {
  public async list(reqUser: ReqUser, contract_id:number) {
    // Employee chỉ xem audit rút gọn của HĐ mình
    if (isEmployee(reqUser)) {
      const ec = await db.EmploymentContract.findByPk(contract_id);
      if (!ec) return { err:1, mes:"Not found" };
      const me = await db.Employee.findOne({ where:{ email:reqUser.email }, attributes:["employee_id"] });
      if (!me || me.employee_id !== ec.employee_id) return { err:1, mes:"Forbidden" };
      // có thể filter bớt action nếu muốn rút gọn
    }
    const rows = await db.ContractAudit.findAll({ where:{ contract_id }, order:[["at","DESC"]]});
    return { err:0, data: rows };
  }
}
export default new ContractAuditService();
