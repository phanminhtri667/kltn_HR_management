import { Router, Request, Response, NextFunction } from 'express';
import verifyToken from '../middlewares/verify_token';
import employeeController from '../controllers/employeeController';
import { body, validationResult } from 'express-validator';

const router = Router();

// Bảo vệ toàn bộ employee API
router.use(verifyToken);

// Route tĩnh nên để trước route động
router.get('/suggest', employeeController.suggestEmployeeIds);

// Lấy all (quyền lọc theo role xử lý trong controller)
router.get('/', employeeController.getAllEmployee);

// Lấy theo phòng ban
router.get('/department/:departmentId', employeeController.getEmployeesByDepartment);

// Validate khi tạo
const validateInsertEmployee = [
  body('full_name').notEmpty().withMessage('Full name is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Tạo
router.post('/', validateInsertEmployee, employeeController.insertEmployee);

// Cập nhật
router.put('/:employeeId', employeeController.updateEmployee);
router.patch('/:employeeId', employeeController.updateEmployee);

// Xoá
router.delete('/:employeeId', employeeController.removeEmployee);

export default router;
