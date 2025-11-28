import express from "express";
import controller from "../controllers/systemSettingController";

const router = express.Router();

// Get list
router.get("/", controller.list);

// GET 1 setting
router.get("/:key", controller.get);

// UPDATE 1 setting
router.put("/:key", controller.update);

export default router;
