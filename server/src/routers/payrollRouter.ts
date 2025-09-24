import express from "express";
import payrollController from "../controllers/payrollController";
import verifyToken from "../middlewares/verify_token";

const router = express.Router();

// Lấy tất cả bảng lương của nhân viên
router.get("/", verifyToken, payrollController.getAll);     // role_1
router.get("/me", verifyToken, payrollController.getMine);  // role_3
export default router;
