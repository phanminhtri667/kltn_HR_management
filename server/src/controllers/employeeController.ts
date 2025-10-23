import EmployeeService from "../services/employeeService";
import { Request, Response } from "express";
import { io } from "../../index";
import UserService from "../services/userService";
import PayrollService from "../services/payrollService";

class EmployeeController {
  public getAllEmployee = async (req: Request, res: Response) => {
    try {
      const user = req.user;  // Lấy thông tin người dùng từ req.user
      if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      if (user.role_code === 'role_1') {
        // Nếu là Admin (role_1), trả về tất cả nhân viên
        const employees = await EmployeeService.getAllEmployee();
        return res.status(200).json(employees);
      }
  
      if (user.role_code === 'role_2') {
        // Nếu là Leader (role_2), trả về nhân viên trong cùng phòng ban
        const employees = await EmployeeService.getEmployeesByDepartment(user.department_id);
        return res.status(200).json(employees);
      }
  
      // Nếu là role_3 (Member), trả về nhân viên của cùng phòng ban (nếu cần)
      const employees = await EmployeeService.getEmployeesByDepartment(user.department_id);
      return res.status(200).json(employees);
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        err: -1,
        mess: "Internal server error",
      });
    }
  };
  
  

  public insertEmployee = async (req: Request, res: Response) => {
  try {
    const user = req.user;  // Lấy thông tin người dùng từ req.user
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Kiểm tra xem người dùng có phải là role_1 (Admin) hay không
    if (user.role_code !== 'role_1') {
      return res.status(403).json({ message: "Permission denied: Only Admin can add employees." });
    }

    const response = await EmployeeService.insertEmployee(req.body);
    if (response.err === 0) {
      io.emit("employee_created", response.mes);  // Nếu tạo thành công, phát sự kiện
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      err: -1,
      mess: "Internal server error",
    });
  }
};

  public suggestEmployeeIds = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    if (!q || q.length < 1) return res.status(200).json({ err: 0, data: [] });
    const ids = await EmployeeService.getEmployeeIdSuggestions(q);
    return res.status(200).json({ err: 0, data: ids });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: -1, mess: "Internal server error" });
  }
};

  public updateEmployee = async (req: Request, res: Response) => {
  try {
    const updatedData = req.body;
    const { employeeId } = req.params;      // giữ string "AD0001"

    // 1) Cập nhật employee
    const response = await EmployeeService.updateEmployee(employeeId, updatedData);
    if (response.err !== 0) {
      return res.status(200).json(response);
    }

    // 2) Nếu có sửa lương cơ bản (hoặc bạn muốn luôn rebuild), cập nhật payslip draft tương ứng
    if (updatedData.basic_salary !== undefined) {
      // month có thể truyền từ FE (vd updatedData.month) hoặc bạn để undefined để rebuild bản gần nhất
      await PayrollService.updatePayrollWhenDataChangesByEmployee(employeeId, updatedData.month, updatedData);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: -1, mess: "Internal server error" });
  }
};



  public removeEmployee = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const response = await EmployeeService.removeEmployee(employeeId);
      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        err: -1,
        mess: "Internal server error",
      });
    }
  };
  public getEmployeesByDepartment = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const employees = await EmployeeService.getEmployeesByDepartment(Number(departmentId));
    return res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      err: -1,
      mess: "Internal server error",
    });
  }
};


}

export default new EmployeeController();
