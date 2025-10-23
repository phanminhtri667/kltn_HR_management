"use strict";
import { Request, Response } from "express";

// Lưu ý: tên file service chữ thường như trong project của bạn
import EmploymentContractService from "../services/employmentContractService";
import ContractSignatureService from "../services/contractSignatureService";
import ContractAmendmentService from "../services/contractAmendmentService";
import ContractAttachmentService from "../services/contractAttachmentService";
import ContractAuditService from "../services/contractAuditService";
import ContractCronService from "../services/contractCronService";

// middleware auth của bạn gán req.user theo cấu trúc này
type ReqUser = {
  email: string;
  role_code: "role_1" | "role_2" | "role_3";
  department_id?: number | null;
  employee_id?: string;
};

export default class ContractController {
  // ========= Employment contracts =========
  static async create(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.create(user, req.body);
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async list(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.list(user, {
      status: (req.query.status as string) || undefined,
      employee_id: (req.query.employee_id as string) || undefined,
      dept_id: req.query.department_id ? Number(req.query.department_id) : undefined,
    });
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async detail(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.detail(user, Number(req.params.id));
    return res.status(out.err ? 403 : 200).json(out);
  }

  static async updateDraft(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.updateDraft(
      user,
      Number(req.params.id),
      req.body
    );
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async submitApproval(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.submitApproval(user, Number(req.params.id));
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async approve(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.approve(user, Number(req.params.id));
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async sendForSigning(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.sendForSigning(user, Number(req.params.id));
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async activate(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.activate(user, Number(req.params.id));
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async terminate(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await EmploymentContractService.terminate(
      user,
      Number(req.params.id),
      req.body?.reason
    );
    return res.status(out.err ? 400 : 200).json(out);
  }

  // ========= Signatures =========
  static async setSigners(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await ContractSignatureService.setSigners(
      user,
      Number(req.params.id),
      req.body?.signers || []
    );
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async sign(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await ContractSignatureService.sign(
      user,
      Number(req.params.id),
      Number(req.params.order),
      req.body?.evidence
    );
    return res.status(out.err ? 400 : 200).json(out);
  }

  // ========= Amendments =========
  static async addAmendment(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await ContractAmendmentService.create(user, {
      contract_id: Number(req.params.id),
      ...req.body,
    });
    return res.status(out.err ? 400 : 200).json(out);
  }

  // ========= Attachments =========
  static async addAttachment(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await ContractAttachmentService.add(user, Number(req.params.id), req.body);
    return res.status(out.err ? 400 : 200).json(out);
  }

  static async listAttachments(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await ContractAttachmentService.list(user, Number(req.params.id));
    return res.status(out.err ? 403 : 200).json(out);
  }

  // ========= Audits =========
  static async listAudits(req: Request, res: Response) {
    const user = req.user as ReqUser;
    const out = await ContractAuditService.list(user, Number(req.params.id));
    return res.status(out.err ? 403 : 200).json(out);
  }

  // ========= Cron =========
  static async dailyCron(req: Request, res: Response) {
    const out = await ContractCronService.daily();
    return res.status(out.err ? 400 : 200).json(out);
  }
}
