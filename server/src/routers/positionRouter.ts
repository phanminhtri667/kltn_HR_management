import { Router } from 'express';
import positionController from '../controllers/positionController';

const router = Router();
router.get('/', positionController.getPosition);

export default router;
