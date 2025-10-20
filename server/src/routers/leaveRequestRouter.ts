import express from "express";
import LeaveRequestController from "../controllers/leaveRequestController";
import verifyToken from "../middlewares/verify_token";

const router = express.Router();

router.use(verifyToken);

// Nhân viên gửi đơn nghỉ
router.post("/", LeaveRequestController.createLeave);

// Lấy danh sách đơn của chính mình
router.get("/my", LeaveRequestController.getMyLeaves);

// Dành cho leader/admin xem tất cả
router.get("/", LeaveRequestController.getAllLeaves);

// Duyệt đơn
router.patch("/:id/approve", LeaveRequestController.approveLeave);

// Từ chối đơn
router.patch("/:id/reject", LeaveRequestController.rejectLeave);

// Huỷ đơn
router.patch("/:id/cancel", LeaveRequestController.cancelLeave);

export default router;
