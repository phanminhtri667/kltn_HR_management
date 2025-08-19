import { Router } from "express";
import notificationController from "../controllers/notificationController";

const router = Router();
router.get("/", notificationController.getNotification);

export default router;
