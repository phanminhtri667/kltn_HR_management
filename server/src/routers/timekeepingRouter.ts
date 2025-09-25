import { Router } from "express";
import timekeepingController from "../controllers/timekeepingController"; // Import controller
import verifyToken from "../middlewares/verify_token"; // Middleware để kiểm tra token

const router = Router();

// Lọc qua query: ?employee_id=AD0001&department_id=1&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
router.get("/", verifyToken, timekeepingController.getAll);  // Admin (role_1) và Quản lý (role_2) xem dữ liệu phòng ban

// Xem chấm công của chính mình (role_3) hoặc nhân viên trong phòng ban của mình (role_2)
router.get("/mine", verifyToken, timekeepingController.getMine);  // Nhân viên xem của chính họ và Quản lý xem của phòng ban

// Xem chấm công theo phòng ban (quản lý hoặc admin)
router.get("/department/:departmentId", verifyToken, timekeepingController.getByDepartment);  // Chỉ quản lý hoặc admin mới xem phòng ban

// Nhân viên check-in (tạo bản ghi mới)
router.post("/", verifyToken, timekeepingController.create);  // Cần verifyToken để tạo bản ghi check-in

// Nhân viên check-out (cập nhật checkout + status)
router.patch("/checkout", verifyToken, timekeepingController.checkout);  // Cần verifyToken để cập nhật checkout

export default router;
