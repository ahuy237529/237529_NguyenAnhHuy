require("dotenv").config();

const dns = require("node:dns");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Employee = require("./models/Employee");
const employeeRoutes = require("./routes/employees");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Khi chạy local, sử dụng DNS Google mặc định.
// Trên Render (NODE_ENV=production), sử dụng DNS của hệ thống.
// Có thể cấu hình riêng bằng biến DNS_SERVERS.
const dnsServers =
  process.env.DNS_SERVERS ||
  (process.env.NODE_ENV !== "production"
    ? "8.8.8.8,8.8.4.4"
    : "");

if (dnsServers.trim()) {
  try {
    dns.setServers(
      dnsServers
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    );

    console.log("DNS đang sử dụng:", dns.getServers());
  } catch {
    console.error("DNS_SERVERS không hợp lệ");
    process.exit(1);
  }
}

// Danh sách Frontend được phép gọi API.
const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://localhost:4173"
)
  .split(",")
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // curl/Postman thường không gửi Origin.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(
        "Địa chỉ Frontend chưa được cho phép trong CLIENT_URL"
      );

      error.status = 403;
      callback(error);
    }
  })
);

app.use(express.json({ limit: "100kb" }));

// Trang gốc Backend.
app.get("/", (req, res) => {
  res.json({
    message: "Backend quản lý nhân sự đang hoạt động",
    health: "/health",
    employees: "/api/employees"
  });
});

// Kiểm tra trạng thái Backend và MongoDB.
app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Các API quản lý nhân viên.
app.use("/api/employees", employeeRoutes);

// Đường dẫn không tồn tại.
app.use((req, res) => {
  res.status(404).json({
    message: "API không tồn tại"
  });
});

// Ẩn URI MongoDB nếu nó xuất hiện trong thông báo lỗi.
function safeMessage(value) {
  return String(value || "").replace(
    /mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi,
    "[Đã ẩn URI MongoDB]"
  );
}

// Xử lý lỗi API.
app.use((error, req, res, next) => {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Mã nhân viên đã tồn tại"
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join("; ")
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ"
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Nội dung JSON không hợp lệ"
    });
  }

  if (error.status) {
    return res.status(error.status).json({
      message: error.message
    });
  }

  console.error("API error:", {
    name: error.name,
    message: safeMessage(error.message)
  });

  res.status(500).json({
    message: "Lỗi máy chủ, vui lòng thử lại"
  });
});

// In chi tiết lỗi khởi động.
function printStartupError(error) {
  console.error("Không thể khởi động Backend");

  console.error({
    name: error.name,
    code: error.code,
    syscall: error.syscall,
    hostname: error.hostname,
    message: safeMessage(error.message)
  });

  if (error.reason) {
    console.error("Topology:", error.reason.type);

    for (const [address, server] of error.reason.servers || []) {
      console.error("Chi tiết máy chủ:", {
        address,
        type: server.type,
        errorName: server.error?.name,
        errorCode: server.error?.code,
        errorMessage: safeMessage(server.error?.message),
        causeCode: server.error?.cause?.code,
        causeMessage: safeMessage(server.error?.cause?.message)
      });
    }
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB đã ngắt kết nối");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", {
    name: error.name,
    code: error.code
  });
});

async function startServer() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.error("Thiếu MONGODB_URI trong backend/.env");
    process.exit(1);
  }

  if (
    !uri.startsWith("mongodb://") &&
    !uri.startsWith("mongodb+srv://")
  ) {
    console.error(
      "MONGODB_URI phải bắt đầu bằng mongodb:// hoặc mongodb+srv://"
    );
    process.exit(1);
  }

  try {
    console.log("Đang kết nối MongoDB Atlas...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 10000
    });

    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);

    // Tạo/kiểm tra chỉ mục duy nhất của employeeId.
    await Employee.init();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(
        `Employees: http://localhost:${PORT}/api/employees`
      );
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Cổng ${PORT} đang được sử dụng. Hãy dừng Backend cũ trước.`
        );
      } else {
        printStartupError(error);
      }

      process.exit(1);
    });
  } catch (error) {
    printStartupError(error);
    process.exit(1);
  }
}

startServer();