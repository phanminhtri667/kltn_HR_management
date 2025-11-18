import { Router } from "express";
import notificationController from "../controllers/notificationController";
import verifyToken from "../middlewares/verify_token";

const router = Router();
router.get("/", verifyToken, notificationController.getNotifications);
export default router;
