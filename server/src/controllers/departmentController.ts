import DepartmentService from "../services/departmentService";
import { Request, Response } from "express";
import { io } from "../../index";
class DepartmentController {
  public getDepartment = async (req: Request, res: Response) => {
    try {
      const response = await DepartmentService.getAllDepartment();
      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        err: -1,
        mess: "Internal server error",
      });
    }
  };

  public insertDepartment = async (req: Request, res: Response) => {
    try {
      const response = await DepartmentService.insertDepartment(req.body);
      if (response.err === 0) {
        io.emit("department_created", response.message);
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        err: -1,
        mess: "Internal server error",
      });
    }
  };
}

export default new DepartmentController();
