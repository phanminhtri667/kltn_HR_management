import { Router } from "express";
import workingHoursController from "../controllers/workingHoursController";

const router = Router();

// Lấy cấu hình giờ làm (luôn 1 record)
router.get("/", workingHoursController.getConfig);

// Cập nhật cấu hình giờ làm (id = 1)
router.put("/", workingHoursController.updateConfig);

export default router;
