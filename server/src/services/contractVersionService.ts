"use strict";
import db from "../models";
import { ReqUser, isAdmin, isManager, isEmployee } from '../utils/Authz';

class ContractVersionService {
  public async snapshot(reqUser: ReqUser, contract_id:number, template_id:number|null, version_no:number, html?:string|null, pdf_path?:string|null) {
    if (!isAdmin(reqUser) && !isManager(reqUser)) return { err:1, mes:"Forbidden" };
    const row = await db.ContractVersion.create({ contract_id, template_id, version_no, rendered_body_html: html ?? null, rendered_body_pdf_path: pdf_path ?? null });
    await db.ContractAudit.create({ contract_id, action:"snapshot", by_user:(reqUser as any)?.id ?? null, meta:{ version_no, pdf_path: pdf_path ?? null } });
    return { err:0, data: row };
  }
  public async latest(reqUser: ReqUser, contract_id:number) {
    const row = await db.ContractVersion.findOne({ where:{ contract_id }, order:[["version_no","DESC"]]});
    return { err:0, data: row };
  }
}
export default new ContractVersionService();
