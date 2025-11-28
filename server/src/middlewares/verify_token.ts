// server/src/middlewares/verify_token.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { badRequest, notAuth } from "./handle_error";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || "";
  console.log("Authorization Header:", authHeader);  // Kiểm tra Authorization Header

  // Expect: "Bearer <token>"
  const parts = authHeader.split(" ");
  const accessToken = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : "";

  if (!accessToken) {
    console.log("No token provided");  // Log nếu không có token
    return notAuth(res, "Not authorization");
  }

  // Kiểm tra và xác thực token
  jwt.verify(accessToken, process.env.JWT_SECRET as string, (err, payload) => {
    if (err) {
      console.log("Token verification failed:", err);  // Log khi token không hợp lệ
      return notAuth(res, "Authorization expired");
    }

    // payload do AuthService ký: { id, email, role_code, department_id, type: 'user' | 'employee', ... }
    const p: any = payload || {};
    const type = p?.type === "employee" ? "employee" : "user";

    // Chuẩn hoá tối thiểu, giữ nguyên payload cũ qua _raw để tránh vỡ code cũ
    const normalized = {
      email: p.email,
      role_code: p.role_code,
      department_id: p.department_id ?? null,
      type,                                   // 'user' | 'employee'
      id: type === "user" ? Number(p.id) : undefined,           // users.id (INT)
      employee_id: type === "employee" ? String(p.id) : undefined, // employees.employee_id (STRING)
      _raw: p,                                // giữ lại payload gốc cho tương thích ngược
    };

    console.log("User from token (normalized):", normalized);
    (req as any).user = normalized;  // Gán thông tin người dùng vào req.user
    next();
  });
};

export default verifyToken;
