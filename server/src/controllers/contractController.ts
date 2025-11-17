"use strict";
import { Request, Response } from "express";
import { ReqUser } from "../utils/Authz";

import EmploymentContractService from "../services/employmentContractService";
import ContractSignatureService from "../services/contractSignatureService";
import ContractAmendmentService from "../services/contractAmendmentService";
import ContractAttachmentService from "../services/contractAttachmentService";
import ContractAuditService from "../services/contractAuditService";
import ContractCronService from "../services/contractCronService";
import ContractTemplateService from "../services/contractTemplateService";

export default class ContractController {
  /* ============================================================
   * 1️⃣ FORM KHỞI TẠO HỢP ĐỒNG (từ Template)
   * ============================================================ */
  static async createForm(req: Request, res: Response) {
    try {
      const user = req.user as ReqUser;
      const templateId = Number(req.query.template_id);
      const employeeId = (req.query.employee_id as string) || undefined;

      if (!templateId || Number.isNaN(templateId)) {
        return res.status(400).json({ err: 1, mes: "template_id is required (number)" });
      }

      const out = await EmploymentContractService.buildCreateForm(user, { templateId, employeeId });
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (createForm)",
      });
    }
  }

  /* ============================================================
   * 2️⃣ CRUD CƠ BẢN
   * ============================================================ */
  static async create(req: Request, res: Response) {
    try {
      const user = req.user as ReqUser;
      const out = await EmploymentContractService.create(user, req.body);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (create)",
      });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const user = req.user as ReqUser;
      const dept_id_raw = req.query.department_id ? Number(req.query.department_id) : undefined;
      const dept_id = typeof dept_id_raw === "number" && !Number.isNaN(dept_id_raw) ? dept_id_raw : undefined;

      const out = await EmploymentContractService.list(user, {
        status: (req.query.status as string) || undefined,
        employee_id: (req.query.employee_id as string) || undefined,
        dept_id,
      });
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (list)",
      });
    }
  }

  static async detail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await EmploymentContractService.detail(user, id);
      return res.status(out.err ? 403 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (detail)",
      });
    }
  }

  static async updateDraft(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await EmploymentContractService.updateDraft(user, id, req.body);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (updateDraft)",
      });
    }
  }

  /* ============================================================
   * 3️⃣ QUY TRÌNH PHÊ DUYỆT / KÝ / TRẠNG THÁI
   * ============================================================ 
  static async submitApproval(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await EmploymentContractService.submitApproval(user, id);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (submitApproval)",
      });
    }
  }*/

  static async approve(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await EmploymentContractService.approve(user, id);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (approve)",
      });
    }
  }

  static async sendForSigning(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await EmploymentContractService.sendForSigning(user, id);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (sendForSigning)",
      });
    }
  }

  static async sign(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);       // lấy contract_id từ URL
    const order = Number(req.params.order); // lấy sign_order từ URL

    if (Number.isNaN(id) || Number.isNaN(order))
      return res.status(400).json({ err: 1, mes: "Invalid id/order" });

    const user = req.user as ReqUser;

    // gọi service xử lý ký
    const out = await ContractSignatureService.sign(
      user,
      id,
      order,
      req.body?.evidence // dữ liệu chứng thực chữ ký (nếu có)
    );

    return res.status(out.err ? 400 : 200).json(out);
  } catch (e: any) {
    return res.status(500).json({
      err: 1,
      mes: e?.message || "Internal Server Error (sign)",
    });
  }
}


  /*static async activate(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await EmploymentContractService.activate(user, id);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (activate)",
      });
    }
  }*/

  static async terminate(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await EmploymentContractService.terminate(user, id, req.body?.reason);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (terminate)",
      });
    }
  }

  /* ============================================================
   * 4️⃣ PHỤ LỤC / ĐÍNH KÈM / AUDIT
   * ============================================================ */
  static async setSigners(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await ContractSignatureService.setSigners(user, id, req.body?.signers || []);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (setSigners)",
      });
    }
  }

  static async addAmendment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await ContractAmendmentService.create(user, { contract_id: id, ...req.body });
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (addAmendment)",
      });
    }
  }

  static async addAttachment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await ContractAttachmentService.add(user, id, req.body);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (addAttachment)",
      });
    }
  }

  static async listAttachments(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await ContractAttachmentService.list(user, id);
      return res.status(out.err ? 403 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (listAttachments)",
      });
    }
  }

  static async listAudits(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ err: 1, mes: "Invalid id" });
      const user = req.user as ReqUser;
      const out = await ContractAuditService.list(user, id);
      return res.status(out.err ? 403 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (listAudits)",
      });
    }
  }

  /* ============================================================
   * 5️⃣ CRON JOB (tự động kích hoạt, hết hạn)
   * ============================================================ */
  static async dailyCron(_req: Request, res: Response) {
    try {
      const out = await ContractCronService.daily();
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Internal Server Error (dailyCron)",
      });
    }
  }

  /* ============================================================
   * 6️⃣ TEMPLATE – Danh sách template hợp đồng
   * ============================================================ */
  static async listTemplates(req: Request, res: Response) {
    try {
      const filter = {
        name: (req.query.name as string) || undefined,
        locale: (req.query.locale as string) || undefined,
        activeOnly: req.query.activeOnly === "true" ? true : undefined,
      };
      const out = await ContractTemplateService.list(req.user as ReqUser, filter);
      return res.status(out.err ? 400 : 200).json(out);
    } catch (e: any) {
      return res.status(500).json({
        err: 1,
        mes: e?.message || "Error fetching contract templates",
      });
    }
  }
}
