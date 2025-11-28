import express from "express";
import payrollController from "../controllers/payrollController";
import verifyToken from "../middlewares/verify_token";
import systemSettingRouter from "./systemSettingRoutes";

const router = express.Router();

// Payroll GET
router.get("/", verifyToken, payrollController.getAll);
router.get("/me", verifyToken, payrollController.getMine);

// Payroll settings (FE chỉnh ngày cron)
router.use("/settings", verifyToken, systemSettingRouter);


export default router;
