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
  jwt.verify(accessToken, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);  // Log khi token không hợp lệ
      return notAuth(res, "Authorization expired");
    }

    console.log("User from token:", user);  // Log thông tin người dùng từ token
    (req as any).user = user;  // Gán thông tin người dùng vào req.user
    next();
  });
};

export default verifyToken;
