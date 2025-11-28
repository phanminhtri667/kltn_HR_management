"use strict";
import db from "../models";
import { Transaction } from "sequelize";
import { ReqUser, isAdmin, isManager, isEmployee } from '../utils/Authz';

class ContractTemplateService {
  // Manager có thể tạo template; Admin cũng được
  public async create(reqUser: ReqUser, payload: { name:string; version?:number; locale?:string; body_markdown?:string|null; placeholders:any; is_active?:boolean }) {
    if (!isAdmin(reqUser) && !isManager(reqUser)) return { err:1, mes:"Forbidden" };
    try {
      const tpl = await db.ContractTemplate.create({
        name: payload.name,
        version: payload.version ?? 1,
        locale: payload.locale ?? 'vi-VN',
        body_markdown: payload.body_markdown ?? null,
        placeholders: payload.placeholders,
        is_active: payload.is_active ?? true
      });
      return { err:0, data: tpl };
    } catch (e:any) {
      return { err:1, mes:"Create template failed" };
    }
  }

  public async list(reqUser: ReqUser, filter?: { name?:string; locale?:string; activeOnly?:boolean }) {
    const where:any = {};
    if (filter?.name) where.name = filter.name;
    if (filter?.locale) where.locale = filter.locale;
    if (filter?.activeOnly) where.is_active = true;
    const rows = await db.ContractTemplate.findAll({ where, order:[["name","ASC"],["version","DESC"]] });
    return { err:0, data: rows };
  }

  // Admin có thể update/disable; Manager có thể update bản nháp (policy tuỳ)
  public async update(reqUser: ReqUser, id:number, patch:any) {
    if (!isAdmin(reqUser) && !isManager(reqUser)) return { err:1, mes:"Forbidden" };
    const row = await db.ContractTemplate.findByPk(id);
    if (!row) return { err:1, mes:"Template not found" };
    await row.update(patch);
    return { err:0, data: row };
  }

  // (tuỳ chọn) render placeholders -> HTML
  public async renderToHtml(reqUser: ReqUser, id:number, vars:any) {
    const tpl = await db.ContractTemplate.findByPk(id);
    if (!tpl) return { err:1, mes:"Template not found" };
    // TODO: dùng Mustache/Handlebars/… để render tpl.body_markdown + vars
    const html = "<html><body><!-- render here --></body></html>";
    return { err:0, data:{ html } };
  }
}
export default new ContractTemplateService();
