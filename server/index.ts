import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

// Routers
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

// Middlewares
import { notFound, errorHandler } from "./src/middlewares/handle_error";

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/timekeeping", timekeepingRouter);
app.use("/api/leave-request", leaveRequestRouter);

// Health check
app.get("/", (_req, res) => res.send("API OK"));
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/role", roleRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/department", departmentRouter);
app.use("/api/position", positionRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/timekeeping", timekeepingRouter);
app.use("/api/working-hours", workingHoursRouter);

// Error handling (⚡ phải đặt cuối cùng)
app.use(notFound);
app.use(errorHandler);

// Socket.IO events
io.on("connection", (socket) => {
  console.log("⚡ A user connected");

  socket.on("request_notification", () => {
    io.emit("notification");
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

export { app, server, io };
