// routes/payrollChangeRoutes.ts
import { Router } from "express";
import verifyToken from "../middlewares/verify_token";
import PayrollChangeController from "../controllers/payrollChangeController";

const router = Router();

// chỉ cần verifyToken — controller đã check role_1 rồi
router.get("/", verifyToken, PayrollChangeController.getChanges);

export default router;
