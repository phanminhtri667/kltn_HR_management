// src/routers/contractsRouter.ts
"use strict";
import { Router } from "express";
import ContractController from "../controllers/contractController";

const r = Router();

// ===== Employment contracts
r.post("/", ContractController.create);
r.get("/", ContractController.list);
r.get("/:id", ContractController.detail);
r.put("/:id/draft", ContractController.updateDraft);

r.post("/:id/submit-approval", ContractController.submitApproval);
r.post("/:id/approve", ContractController.approve);
r.post("/:id/send-for-signing", ContractController.sendForSigning);
r.post("/:id/activate", ContractController.activate);
r.post("/:id/terminate", ContractController.terminate);

// ===== Signatures
r.post("/:id/signers", ContractController.setSigners);
r.post("/:id/sign/:order", ContractController.sign);

// ===== Amendments
r.post("/:id/amendments", ContractController.addAmendment);

// ===== Attachments
r.post("/:id/attachments", ContractController.addAttachment);
r.get("/:id/attachments", ContractController.listAttachments);

// ===== Audits
r.get("/:id/audits", ContractController.listAudits);

// ===== Cron
r.post("/cron/daily", ContractController.dailyCron);

export default r;
