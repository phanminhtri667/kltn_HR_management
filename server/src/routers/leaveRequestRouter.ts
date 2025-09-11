import express from "express";
import * as leaveRequestController from "../controllers/leaveRequestController";
import { approveLeaveRequest } from "../controllers/leaveRequestController";
import verifyToken from "../middlewares/verify_token";


const router = express.Router();

router.use(verifyToken);

router.post('/', leaveRequestController.createLeaveRequest);
router.get('/my', leaveRequestController.getMyLeaveRequests);

// Admin/Leader
router.get('/', leaveRequestController.getAllLeaveRequests);
//router.patch('/:id/approve', leaveRequestController.approveLeaveRequest);
router.patch("/:id/approve", approveLeaveRequest); // Duyệt đơn nghỉ phép
router.patch('/:id/reject', leaveRequestController.rejectLeaveRequest);

export default router;
