import express from "express";
import "dotenv/config";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

// =======================
// Allowed FE origins
// =======================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4001",
  "http://hr.thongtri.com",
];

const app = express();
const server = http.createServer(app);

// =======================
// CORS GLOBAL MIDDLEWARE
// =======================
app.use((req, res, next) => {
  const origin = req.headers.origin as string;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// =======================
// Body parser
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// ROUTERS
// =======================
import authRouter from "./src/routers/authRouter";
import roleRouter from "./src/routers/roleRouter";
import userRouter from "./src/routers/userRouter";
import employeeRouter from "./src/routers/employeeRouter";
import departmentRouter from "./src/routers/departmentRouter";
import positionRouter from "./src/routers/positionRouter";
import notificationRouter from "./src/routers/notificationRouter";
import leaveRequestRouter from "./src/routers/leaveRequestRouter";
import timekeepingRouter from "./src/routers/timekeepingRouter";
import workingHoursRouter from "./src/routers/workingHoursRouter";
import payrollRouter from "./src/routers/payrollRouter";
import payrollChangeRouter from "./src/routers/payrollChangeRouter";
import legalEntityRouter from "./src/routers/legalEntityRouter";
import contractsRouter from "./src/routers/contractsRouter";
import "./src/cronJobs/payrollJob";



import verifyToken from "./src/middlewares/verify_token";
import { notFound, errorHandler } from "./src/middlewares/handle_error";

// TEST ROUTES
app.get("/", (_req, res) => res.send("API OK"));
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/role", roleRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/department", departmentRouter);
app.use("/api/position", positionRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/leave-request", leaveRequestRouter);
app.use("/api/timekeeping", timekeepingRouter);
app.use("/api/working-hours", workingHoursRouter);
app.use("/api/leaves", leaveRequestRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/payroll-changes", payrollChangeRouter);
app.use("/api/legal-entities", legalEntityRouter);
app.use("/api/contracts", verifyToken, contractsRouter);

app.use(notFound);
app.use(errorHandler);

// =======================
// SOCKET.IO
// =======================
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// =======================
// START SERVER
// =======================
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { app, server, io };
