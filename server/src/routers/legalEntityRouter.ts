// server/src/routers/legalEntityRouter.ts
import { Router } from "express";
import verifyToken from "../middlewares/verify_token";
import LegalEntityController from "../controllers/legalEntityController";

const r = Router();
r.use(verifyToken);

r.get("/", LegalEntityController.list);


export default r;
