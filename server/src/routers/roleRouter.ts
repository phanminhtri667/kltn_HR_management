
import { Router } from 'express';
import roleControler from '../controllers/roleController';

const router = Router();

router.get('/', roleControler.getAll);

export default router;
