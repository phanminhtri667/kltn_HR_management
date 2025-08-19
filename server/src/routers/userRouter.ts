import { Router } from 'express';
import userController from '../controllers/userController';
import verifyToken from "../middlewares/verify_token";

const router = Router();

router.use(verifyToken)
router.get('/', userController.getCurrentUser);
// router.post('/login', authController.login);

export default router;
