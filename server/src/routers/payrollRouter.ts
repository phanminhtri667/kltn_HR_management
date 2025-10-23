import express from "express";
import payrollController from "../controllers/payrollController";
import verifyToken from "../middlewares/verify_token";
import ensurePayrollDay1 from "../middlewares/ensurePayrollDay1";


const router = express.Router();

// Lấy tất cả bảng lương của nhân viên
router.get("/", verifyToken, payrollController.getAll);     // role_1
router.get("/me", verifyToken, payrollController.getMine);  // role_3
router.use(verifyToken, ensurePayrollDay1);
export default router;
