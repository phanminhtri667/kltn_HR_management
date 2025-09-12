import DepartmentService from "../services/departmentService";
import { Request, Response } from "express";
import { io } from "../../index";

class DepartmentController {
  // Lấy danh sách phòng ban
  public getDepartment = async (req: Request, res: Response) => {
    try {
      const response = await DepartmentService.getAllDepartment();
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in getDepartment:", error);
      return res.status(500).json({
        err: -1,
        mes: "Internal server error",
      });
    }
  };

  // Cập nhật phòng ban
  public updateDepartment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ err: 1, mes: "Invalid department id" });
      }

      const response = await DepartmentService.updateDepartment(id, req.body);
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in updateDepartment:", error);
      return res.status(500).json({
        err: -1,
        mes: "Internal server error",
      });
    }
  };

  // Tạo mới phòng ban
  public insertDepartment = async (req: Request, res: Response) => {
    try {
      const response = await DepartmentService.insertDepartment(req.body);

      if (response.err === 0) {
        io.emit("department_created", response.mes); // ✅ đồng bộ với service (mes thay vì message)
        return res.status(201).json(response);
      }

      return res.status(400).json(response);
    } catch (error) {
      console.error("Error in insertDepartment:", error);
      return res.status(500).json({
        err: -1,
        mes: "Internal server error",
      });
    }
  };
}

export default new DepartmentController();
