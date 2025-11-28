import { Router } from "express";
import timekeepingController from "../controllers/timekeepingController"; // Import controller
import verifyToken from "../middlewares/verify_token"; // Middleware để kiểm tra token

const router = Router();

// Định nghĩa lại các route sau khi sửa
// 1. Route để xem tất cả chấm công, phân quyền theo role
router.get("/", verifyToken, timekeepingController.getAll);  
// Admin (role_1) và Quản lý (role_2) có thể xem tất cả dữ liệu chấm công, hoặc lọc theo phòng ban.

// 2. Route để xem chấm công của chính mình hoặc phòng ban mình quản lý
router.get("/mine", verifyToken, timekeepingController.getMine);  
// Nhân viên xem của chính họ, Quản lý xem của phòng ban mình quản lý

// 3. Route để xem chấm công theo phòng ban (quản lý hoặc admin)
router.get("/department/:departmentId", verifyToken, timekeepingController.getByDepartment);  
// Chỉ quản lý hoặc admin mới xem phòng ban

// 4. Route để nhân viên check-in (tạo bản ghi mới)
router.post("/", verifyToken, timekeepingController.createCheckIn);  
// Cần verifyToken để tạo bản ghi check-in

// 5. Route để nhân viên check-out (cập nhật checkout + status)
router.patch("/checkout", verifyToken, timekeepingController.checkout);  
// Cần verifyToken để cập nhật checkout

export default router;
