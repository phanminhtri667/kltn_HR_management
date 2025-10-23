"use strict";
import db from "../models";
import { Transaction, Op } from "sequelize";
import moment from "moment";
import { ReqUser, isAdmin, isManager, isEmployee } from '../utils/Authz';

type CreateContractInput = {
  contract_code: string;
  employee_id: string;
  template_id?: number|null;
  contract_type: 'fixed_term'|'indefinite'|'probation'|'part_time'|'contractor';
  job_title?: string|null;
  department_id?: number|null;
  position_id?: number|null;
  work_location?: string|null;
  start_date: string; // YYYY-MM-DD
  end_date?: string|null;
  probation_end_date?: string|null;
  base_salary: number;
  currency?: string;
  pay_frequency?: 'monthly'|'biweekly'|'weekly';
  placeholders?: Record<string,any>;
};

class EmploymentContractService {
  // Manager tạo hợp đồng (draft). Admin cũng có thể tạo nếu muốn (policy mềm).
  public async create(reqUser: ReqUser, input: CreateContractInput) {
    if (!isManager(reqUser) && !isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    return await db.sequelize.transaction(async (t:Transaction) => {
      const ec = await db.EmploymentContract.create({
        ...input,
        currency: input.currency ?? "VND",
        pay_frequency: input.pay_frequency ?? "monthly",
        status: "draft",
        created_by: (reqUser as any)?.id ?? null
      }, { transaction: t });

      // (tuỳ) snapshot nội dung
      // await db.ContractVersion.create({ contract_id: ec.id, template_id: input.template_id ?? null, version_no: 1, rendered_body_html: null }, { transaction: t });

      await db.ContractAudit.create({
        contract_id: ec.id, action: "create", by_user: (reqUser as any)?.id ?? null,
        meta: { input }
      }, { transaction: t });

      return { err:0, data: ec };
    });
  }

  // Danh sách
  public async list(reqUser: ReqUser, filter?: { status?: string; employee_id?: string; dept_id?: number }) {
    const where:any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.employee_id) where.employee_id = filter.employee_id;

    const includeEmp:any = {
      model: db.Employee, as: "employee", attributes:["employee_id","full_name","basic_salary","department_id"],
      include:[ { model: db.Department, as:"department", attributes:["value"] }, { model: db.Position, as:"position", attributes:["value"] } ]
    };

    // Employee chỉ xem HĐ của mình
    if (isEmployee(reqUser)) {
      const me = await db.Employee.findOne({ where:{ email: reqUser.email }, attributes:["employee_id"] });
      if (!me) return { err:0, data: [] };
      where.employee_id = me.employee_id;
    }

    // Manager chỉ xem theo phòng ban của mình (nếu bạn muốn siết)
    if (isManager(reqUser) && reqUser.department_id) {
      includeEmp.where = { department_id: reqUser.department_id };
      includeEmp.required = true;
    }

    if (filter?.dept_id) { // Admin có thể lọc theo dept
      includeEmp.where = { department_id: filter.dept_id };
      includeEmp.required = true;
    }

    const rows = await db.EmploymentContract.findAll({
      where, include:[includeEmp], order:[["start_date","DESC"],["id","DESC"]]
    });
    return { err:0, data: rows };
  }

  public async detail(reqUser: ReqUser, id:number) {
  const row = await db.EmploymentContract.findByPk(id, {
    attributes: [
      'id','contract_code','employee_id','department_id','position_id',
      'job_title','work_location','start_date','end_date','probation_end_date',
      'base_salary','currency','pay_frequency','sign_method','status',
      'signed_at','activated_at','created_at','updated_at'
    ],
    include: [
      // Employee + dept/position của employee (để fallback)
      {
        model: db.Employee,
        as: 'employee',
        attributes: ['employee_id','full_name','email','phone','department_id','position_id'],
        include: [
          { model: db.Department, as: 'department', attributes: ['id','value'] },
          { model: db.Position,   as: 'position',   attributes: ['id','value'] },
        ]
      },
      // Phòng ban gắn trực tiếp trên hợp đồng (nếu có)
      { model: db.Department, as: 'department', attributes: ['id','value'] },

      // Chữ ký – sắp xếp theo thứ tự ký
      {
        model: db.ContractSignature,
        as: 'signatures',
        attributes: ['signer_name','signer_role','sign_status','signed_at','sign_order'],
        separate: true,
        order: [['sign_order','ASC']]
      },

      // Amendment mới nhất để lấy effective_date nếu có
      {
        model: db.ContractAmendment,
        as: 'amendments',
        attributes: ['effective_date','amend_type'],
        limit: 1,
        order: [['effective_date','DESC']]
      },

      // Giữ nguyên các include cũ nếu bạn cần:
      { model: db.ContractAttachment, as:'attachments' },
      { model: db.ContractAudit,      as:'audits' }
    ]
  });

  if (!row) return { err:1, mes:'Contract not found' };

  // Authorization giữ nguyên
  if (isEmployee(reqUser)) {
    const me = await db.Employee.findOne({ where:{ email: reqUser.email }, attributes:['employee_id'] });
    if (!me || me.employee_id !== row.employee_id) return { err:1, mes:'Forbidden' };
  }
  if (isManager(reqUser) && reqUser.department_id && row.department_id && row.department_id !== reqUser.department_id) {
    return { err:1, mes:'Forbidden' };
  }

  // ==== Chuẩn hoá dữ liệu cho UI ====
  const employeeName =
    row.employee?.full_name ?? '';

  const departmentName =
    (row as any).department?.value
    ?? row.employee?.department?.value
    ?? '';

  // Quy ước EffectiveDate: activated_at → signed_at → amendment mới nhất → start_date
  const effectiveDate =
    (row as any).activated_at
    ?? (row as any).signed_at
    ?? row.amendments?.[0]?.effective_date
    ?? (row as any).start_date
    ?? null;

  const signers = (((row as any).signatures ?? []) as any[]).map((s) => ({
    name: s.signer_name,
    role: s.signer_role,
    status: s.sign_status,
    signedAt: s.signed_at,
    order: s.sign_order,
  }));

  return {
    err: 0,
    data: row,                 // dữ liệu gốc nếu FE cần
    view: {                    // dữ liệu đã làm phẳng cho modal
      employeeName,
      departmentName,
      effectiveDate,
      signers
    }
  };
}


  // ===== Transitions theo khuyến nghị =====
  // Manager: draft -> pending_approval
  public async submitApproval(reqUser: ReqUser, id:number) {
    if (!isManager(reqUser) && !isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    return this._setStatus(id, "draft", "pending_approval", "submit_approval", (reqUser as any)?.id);
  }

  // Admin: pending_approval -> approved
  public async approve(reqUser: ReqUser, id:number) {
    if (!isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    return this._setStatus(id, "pending_approval", "approved", "approve", (reqUser as any)?.id);
  }

  // Manager hoặc Admin: approved -> sent_for_signing
  public async sendForSigning(reqUser: ReqUser, id:number) {
    if (!isManager(reqUser) && !isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    // Kiểm tra đã cấu hình signers?
    const c = await db.ContractSignature.count({ where:{ contract_id:id } });
    if (c === 0) return { err:1, mes:"No signers configured" };
    return this._setStatus(id, "approved", "sent_for_signing", "send_for_sign", (reqUser as any)?.id);
  }

  // Hệ thống/Admin: sent_for_signing -> signed (khi all signed)
  public async markSignedIfAllSigned(id:number, by_user?:number|null) {
    const all = await db.ContractSignature.count({ where:{ contract_id: id } });
    const done= await db.ContractSignature.count({ where:{ contract_id: id, sign_status: "signed" } });
    if (all > 0 && all === done) {
      return this._setStatus(id, "sent_for_signing", "signed", "sign_complete", by_user ?? null);
    }
    return { err:1, mes:"Not all signatures are signed" };
  }

  // Admin: signed -> active (khi tới start_date) (hoặc để cron lo)
  public async activate(reqUser: ReqUser, id:number) {
    if (!isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    const c = await db.EmploymentContract.findByPk(id);
    if (!c) return { err:1, mes:"Not found" };
    const today = moment().format("YYYY-MM-DD");
    if (c.status !== "signed") return { err:1, mes:"Invalid state" };
    if ((c as any).start_date > today) return { err:1, mes:"start_date not reached" };
    return this._setStatus(id, "signed", "active", "activate", (reqUser as any)?.id, { activated_at: new Date() });
  }

  // Admin: active -> terminated
  public async terminate(reqUser: ReqUser, id:number, reason?:string) {
    if (!isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    return this._setStatus(id, "active", "terminated", "terminate", (reqUser as any)?.id, { terminated_at: new Date(), terminated_reason: reason ?? null });
  }

  // Manager có thể sửa metadata khi còn draft
  public async updateDraft(reqUser: ReqUser, id:number, patch:any) {
    if (!isManager(reqUser) && !isAdmin(reqUser)) return { err:1, mes:"Forbidden" };
    return await db.sequelize.transaction(async (t:Transaction) => {
      const c = await db.EmploymentContract.findByPk(id, { transaction: t, lock:t.LOCK.UPDATE });
      if (!c) return { err:1, mes:"Not found" };
      if (c.status !== "draft") return { err:1, mes:"Only draft can be updated" };
      await c.update(patch, { transaction: t });
      await db.ContractAudit.create({ contract_id: id, action:"update_draft", by_user:(reqUser as any)?.id ?? null, meta: patch }, { transaction: t });
      return { err:0, data: c };
    });
  }

  private async _setStatus(id:number, from:string, to:string, action:string, by_user?:number|null, extraPatch:any = {}) {
    return await db.sequelize.transaction(async (t:Transaction) => {
      const c = await db.EmploymentContract.findByPk(id, { transaction: t, lock:t.LOCK.UPDATE });
      if (!c) return { err:1, mes:"Contract not found" };
      if (c.status !== from) return { err:1, mes:`Invalid state: need '${from}', got '${c.status}'` };
      await c.update({ status: to, ...extraPatch }, { transaction: t });
      await db.ContractAudit.create({ contract_id: id, action, by_user: by_user ?? null, meta:{ from, to } }, { transaction: t });
      return { err:0, data: c };
    });
  }
}
export default new EmploymentContractService();
