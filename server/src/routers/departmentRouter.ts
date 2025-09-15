import { Router } from "express";
import departmentController from "../controllers/departmentController";

const router = Router();

router.get("/", departmentController.getDepartment);
router.post("/", departmentController.insertDepartment);

// thêm route update
router.put("/:id", departmentController.updateDepartment);

export default router;
