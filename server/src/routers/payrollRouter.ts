import express from "express";
import payrollController from "../controllers/payrollController";

const router = express.Router();

// Lấy tất cả bảng lương của nhân viên
router.get("/", payrollController.getAllPayrolls);  // Tạo route để gọi hàm getAllPayrolls trong controller

export default router;
