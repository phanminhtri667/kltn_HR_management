import { Router } from "express";
import timekeepingController from "../controllers/timekeepingController";

const router = Router();

// Admin xem toàn bộ chấm công
router.get("/", timekeepingController.getAll);

// Xem chấm công theo phòng ban
router.get("/department/:id", timekeepingController.getByDepartment);

// Nhân viên check-in (tạo bản ghi mới)
router.post("/", timekeepingController.create);

// Nhân viên check-out (cập nhật checkout + status)
router.patch("/checkout", timekeepingController.checkout);

export default router;
