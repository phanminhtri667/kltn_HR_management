import { Request, Response } from "express";
import service from "../services/systemSettingService";

class SystemSettingController {
  public list = async (_req: Request, res: Response) => {
    const rows = await service.list();
    return res.json({ err: 0, data: rows });
  };

  public get = async (req: Request, res: Response) => {
    const { key } = req.params;
    const value = await service.get(key);
    return res.json({ err: 0, value });
  };

  public update = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { key } = req.params;
    const { value } = req.body;

    const r = await service.set(user, key, value);
    const status = r.err === 0 ? 200 : 403;

    return res.status(status).json(r);
  };
}

export default new SystemSettingController();
