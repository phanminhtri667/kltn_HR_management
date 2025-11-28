import { Router } from 'express';
import verifyToken from '../middlewares/verify_token';
import userController from '../controllers/userController';

const router = Router();

router.use(verifyToken);

// Chặn non-admin
router.use((req, res, next) => {
  if (req.user?.role_code !== 'role_1') {
    return res.status(403).json({ err: 1, mes: 'Forbidden: Admin only' });
  }
  next();
});
export default router;
