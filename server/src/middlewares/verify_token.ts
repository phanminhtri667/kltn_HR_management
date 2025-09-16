import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { badRequest, notAuth } from "./handle_error";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || "";

  // Expect: "Bearer <token>"
  const parts = authHeader.split(" ");
  const accessToken = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : "";

  if (!accessToken) return notAuth(res, "Not authorization");

  jwt.verify(accessToken, process.env.JWT_SECRET as string, (err, user) => {
    if (err) return notAuth(res, "Authorization expired");
    // nếu muốn gán vào req để downstream dùng:
    (req as any).user = user;
    next();
  });
};

export default verifyToken;
