import EmployeeService from "../services/employeeService";
import { Request, Response } from "express";
import { io } from "../../index";
import UserService from "../services/userService";
import PayrollService from "../services/payrollService";
// (tuỳ) nếu bạn muốn có type gợi ý tốt hơn:
// import { ReqUser } from "../utils/Authz";

class EmployeeController {
  public getAllEmployee = async (req: Request, res: Response) => {
    try {
      const user = req.user; // lấy thông tin người dùng từ req.user
      if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const response = await EmployeeService.getAllEmployee(user);

      return res.status(response.err === 0 ? 200 : 403).json(response);
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
      const user = req.user; // const user = req.user as ReqUser;
      if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Gọi hàm insertEmployee trong EmployeeService để kiểm tra quyền và tạo nhân viên
      const response = await EmployeeService.insertEmployee(user, req.body);

      if (response.err === 0) {
        io.emit("employee_created", response.mes); // Thông báo realtime nếu cần
      }

      return res.status(response.err === 0 ? 200 : 403).json(response);

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
      const { employeeId } = req.params; // giữ string "AD0001"

      // 1) Cập nhật employee
      const response = await EmployeeService.updateEmployee(employeeId, updatedData);
      if (response.err !== 0) {
        return res.status(200).json(response);
      }

      // 2) Nếu có sửa lương cơ bản thì cập nhật payslip draft tương ứng
      if (updatedData.basic_salary !== undefined) {
        await PayrollService.updatePayrollWhenDataChangesByEmployee(
          employeeId,
          updatedData.month, // có thể undefined → service tự xử
          updatedData
        );
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
