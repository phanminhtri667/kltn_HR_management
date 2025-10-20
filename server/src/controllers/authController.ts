import { Request, Response } from "express";
import AuthService from "../services/authService";

class AuthController {
  // Đăng ký
  async register(req: Request, res: Response) {
    try {
      const response = await AuthService.register(req.body);

      if (response.err === 0) {
        return res.status(201).json(response); // Created
      } else {
        return res.status(400).json(response); // Bad Request (Email đã tồn tại)
      }
    } catch (error: any) {
      console.error("Register error detail:", error);
      return res.status(500).json({
        err: 1,
        mes: "Internal server error during register",
        detail: error.message || error,
      });
    }
  }

  // Đăng nhập
  async login(req: Request, res: Response) {
    try {
      const response = await AuthService.login(req.body);

      if (response.err === 0) {
        console.log("login thành công");
        return res.status(200).json(response); // OK
      } else {
        return res.status(401).json(response); // Unauthorized (sai pass / email chưa đăng ký)
      }
    } catch (error: any) {
      console.error("Login error detail:", error);
      return res.status(500).json({
        err: 1,
        mes: "Internal server error during login",
        detail: error.message || error,
      });
    }
  }
}

export default new AuthController();
