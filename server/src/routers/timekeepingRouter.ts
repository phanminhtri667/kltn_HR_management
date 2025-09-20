import { Router } from "express";
import timekeepingController from "../controllers/timekeepingController";
import verifyToken from "../middlewares/verify_token";

const router = Router();

// Lọc qua query: ?employee_id=AD0001&department_id=1&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
//router.get("/", timekeepingController.list);
router.get("/", verifyToken, timekeepingController.list); // Thêm verifyToken vào đây để xác thực người dùng

// (Tuỳ chọn) xem toàn bộ – không filter, dành cho admin
//router.get("/all", timekeepingController.getAll);
router.get("/all", verifyToken, timekeepingController.getAll);  // Thêm verifyToken vào đây để xác thực người dùng

// Xem chấm công theo phòng ban
router.get("/department/:departmentId", timekeepingController.getByDepartment);

// Nhân viên check-in (tạo bản ghi mới)
router.post("/", timekeepingController.create);

// Nhân viên check-out (cập nhật checkout + status)
router.patch("/checkout", timekeepingController.checkout);

export default router;
