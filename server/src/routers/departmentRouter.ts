import { Router } from "express";
import departmentController from "../controllers/departmentController";

const router = Router();
router.get("/", departmentController.getDepartment);
router.post("/", departmentController.insertDepartment);

export default router;
