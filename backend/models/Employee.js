const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Vui lòng nhập mã nhân viên"],
      unique: true,
      uppercase: true,
      trim: true
    },

    fullName: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
      trim: true
    },

    gender: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
      default: "Nam"
    },

    dateOfBirth: {
      type: String,
      default: ""
    },

    department: {
      type: String,
      trim: true,
      default: ""
    },

    position: {
      type: String,
      trim: true,
      default: ""
    },

    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Email không hợp lệ"
      ]
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    hireDate: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Đang làm việc", "Tạm nghỉ", "Đã nghỉ việc"],
      default: "Đang làm việc"
    }
  },
  {
    timestamps: true,
    collection: "employees"
  }
);

module.exports = mongoose.model("Employee", employeeSchema);