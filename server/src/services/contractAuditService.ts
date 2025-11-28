"use strict";
import db from "../models";
import { Op } from "sequelize";
import { ReqUser, isAdmin, isManager, isEmployee } from "../utils/Authz";

type ListOptions = {
  limit?: number;          // mặc định 50
  offset?: number;         // mặc định 0
  actions?: string[];      // ví dụ: ['create','approve','sign','activate','terminate']
};

/**
 * Audit log cho hợp đồng:
 * - Employee chỉ được xem audit của HĐ thuộc về chính mình.
 * - Manager/Admin xem được tất cả.
 * - Hỗ trợ phân trang + lọc theo action.
 */
class ContractAuditService {
  public async list(reqUser: ReqUser, contract_id: number, opts: ListOptions = {}) {
    const limit  = Number.isFinite(opts.limit)  ? Math.max(1, Math.min(200, Number(opts.limit))) : 50;
    const offset = Number.isFinite(opts.offset) ? Math.max(0, Number(opts.offset)) : 0;

    // Lấy hợp đồng để kiểm tra quyền
    const ec = await db.EmploymentContract.findByPk(contract_id, {
      attributes: ["employee_id"],
    });
    if (!ec) return { err: 1, mes: "Not found" };

    // Employee: chỉ được xem audit của hợp đồng thuộc về mình
    if (isEmployee(reqUser)) {
      const me = await db.Employee.findOne({
        where: { email: reqUser.email },
        attributes: ["employee_id"],
      });
      if (!me || me.employee_id !== ec.employee_id) {
        return { err: 1, mes: "Forbidden" };
      }
      // Nếu muốn rút gọn action cho employee, có thể lọc thêm ở đây (giữ nguyên full theo yêu cầu hiện tại)
    }

    const where: any = { contract_id };
    if (opts.actions?.length) {
      where.action = { [Op.in]: opts.actions };
    }

    const rows = await db.ContractAudit.findAll({
      where,
      order: [["at", "DESC"]],
      limit,
      offset,
    });

    return {
      err: 0,
      data: rows,
      page: { limit, offset, count: rows.length },
    };
  }
}

export default new ContractAuditService();
