import express from 'express';
import * as timekeepingController from "../controllers/timekeepingController";
import { clockIn } from "../controllers/timekeepingController";
import verifyToken from '../middlewares/verify_token';


const router = express.Router();

router.use(verifyToken);
router.post("/clock-in", clockIn);  // Chấm công vào

//router.post('/clock-in', timekeepingController.clockIn);
router.post('/clock-out', timekeepingController.clockOut);
router.get('/my', timekeepingController.getMyTimekeeping);

export default router;
