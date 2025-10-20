// server/src/middlewares/handle_error.ts
import { Request, Response, NextFunction } from 'express';

/** ===== Helpers dùng trực tiếp trong controller/middleware ===== */
export function badRequest(res: Response, message = 'Bad Request') {
  return res.status(400).json({ error: message });
}

export function notAuth(res: Response, message = 'Unauthorized') {
  return res.status(401).json({ error: message });
}

export function forbidden(res: Response, message = 'Forbidden') {
  return res.status(403).json({ error: message });
}

export function internalServerError(res: Response, message = 'Internal Server Error') {
  return res.status(500).json({ error: message });
}

/** ===== 404 handler ===== */
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

/** ===== Error handler tổng (đặt CUỐI CÙNG) ===== */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const fromErr =
    (typeof err?.status === 'number' && err.status) ||
    (typeof err?.statusCode === 'number' && err.statusCode) ||
    (typeof err?.code === 'number' && err.code) ||
    parseInt(err?.status, 10) ||
    parseInt(err?.statusCode, 10);

  const status = Number.isInteger(fromErr) && fromErr >= 100 && fromErr <= 599 ? fromErr : 500;
  const message = err?.message || 'Internal Server Error';

  res.status(status).json({ error: message });
}