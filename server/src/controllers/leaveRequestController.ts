import { Request, Response } from "express";
import LeaveService from "../services/leaveService";

class LeaveRequestController {
  // ===== Tạo đơn xin nghỉ =====
  public createLeave = async (req: Request, res: Response) => {
    console.log("==> BODY CLIENT:", req.body);
    try {
      const data = req.body;
      const response = await LeaveService.createLeaveRequest(data);
      return res.status(response.err === 0 ? 200 : 400).json(response);
    } catch (error) {
      console.error("createLeave:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  // ===== Lấy đơn của chính nhân viên =====
  public getMyLeaves = async (req: Request, res: Response) => {
    try {
      const employee_id = req.query.employee_id as string;
      const response = await LeaveService.getLeavesByEmployee(employee_id);
      return res.status(200).json(response);
    } catch (error) {
      console.error("getMyLeaves:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  // ===== Lấy tất cả đơn nghỉ (Leader/Admin) =====
  public getAllLeaves = async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      const response = await LeaveService.getAllLeaves(filters);
      return res.status(200).json(response);
    } catch (error) {
      console.error("getAllLeaves:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  // ===== Duyệt đơn =====
  public approveLeave = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { approver_id } = req.body;
      const response = await LeaveService.approveLeave(id, approver_id);
      return res.status(response.err === 0 ? 200 : 400).json(response);
    } catch (error) {
      console.error("approveLeave:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  // ===== Từ chối đơn =====
  public rejectLeave = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { approver_id, reject_reason } = req.body;
      const response = await LeaveService.rejectLeave(id, approver_id, reject_reason);
      return res.status(response.err === 0 ? 200 : 400).json(response);
    } catch (error) {
      console.error("rejectLeave:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };

  // ===== Huỷ đơn =====
  public cancelLeave = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const response = await LeaveService.cancelLeave(id);
      return res.status(response.err === 0 ? 200 : 400).json(response);
    } catch (error) {
      console.error("cancelLeave:", error);
      return res.status(500).json({ err: -1, mes: "Internal server error" });
    }
  };
}

export default new LeaveRequestController();
