// Trong file index.ts của ứng dụng Node Express
import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./src/routers/authRouter";
import roleRouter from "./src/routers/roleRouter";
import userRouter from "./src/routers/userRouter";
import employeeRouter from "./src/routers/employeeRouter";
import departmentRouter from "./src/routers/departmentRouter";
import positionRouter from "./src/routers/positionRouter";
import notificationRouter from "./src/routers/notificationRouter";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
// thêm 
import { notFound, errorHandler } from "./src/middlewares/handle_error";
import timekeepingRouter from "./src/routers/timekeepingRouter";
import leaveRequestRouter from "./src/routers/leaveRequestRouter";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
//thêm
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
//thêm
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/timekeeping", timekeepingRouter);
app.use("/api/leave-request", leaveRequestRouter);

// Health check cho dễ test
app.get("/", (_req, res) => res.send("API OK")); // ★
app.get("/healthz", (_req, res) => res.json({ status: "ok" })); // ★

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/role", roleRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/department", departmentRouter);
app.use("/api/position", positionRouter);
app.use("/api/notification", notificationRouter);

// Middleware 404 + Error phải đặt SAU cùng
app.use(notFound);       // ★
app.use(errorHandler);   // ★

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("request_notification", () => {
    io.emit("notification");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  }); 
});

const port = process.env.PORT || 8888;
server.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});

export { app, server, io };
