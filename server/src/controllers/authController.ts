import { Request, Response } from "express";
import AuthService from "../services/authService";

function normalizeEmail(e?: string) {
  return (e || "").trim().toLowerCase();
}

class AuthController {
  // Đăng ký
  async register(req: Request, res: Response) {
    try {
      const email = normalizeEmail(req.body?.email);
      const password = String(req.body?.password ?? "");

      if (!email || !password) {
        return res.status(400).json({ err: 1, mes: "Email và mật khẩu là bắt buộc" });
      }
      if (password.length < 6) {
        return res.status(400).json({ err: 1, mes: "Mật khẩu phải từ 6 ký tự" });
      }

      const response = await AuthService.register({ email, password });
      return res.status(response.err === 0 ? 201 : 400).json(response);
    } catch (error: any) {
      console.error("Register error:", error);
      return res.status(500).json({ err: 1, mes: "Internal server error during register" });
    }
  }

  // Đăng nhập
  async login(req: Request, res: Response) {
    try {
      const email = normalizeEmail(req.body?.email);
      const password = String(req.body?.password ?? "");

      if (!email || !password) {
        return res.status(400).json({ err: 1, mes: "Email và mật khẩu là bắt buộc" });
      }

      const response = await AuthService.login({ email, password });
      return res.status(response.err === 0 ? 200 : 401).json(response);
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(500).json({ err: 1, mes: "Internal server error during login" });
    }
  }
}

export default new AuthController();
