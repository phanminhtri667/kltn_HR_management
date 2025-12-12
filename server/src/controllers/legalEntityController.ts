import { Request, Response } from "express";
import LegalEntityService from "../services/legalEntityService";

export default class LegalEntityController {
  static async list(req: Request, res: Response) {
    try {
      const out = await LegalEntityService.list();
      return res.status(200).json(out); // {err:0,data:[...]}
    } catch (e:any) {
      console.error("legal-entities.list error:", e);
      return res.status(500).json({ err:1, mes:"Internal server error" });
    }
  }
}