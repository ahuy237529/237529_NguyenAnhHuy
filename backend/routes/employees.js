const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

const allowedFields = [
  "employeeId",
  "fullName",
  "gender",
  "dateOfBirth",
  "department",
  "position",
  "email",
  "phone",
  "hireDate",
  "status"
];

// Chuyển lỗi của hàm async đến bộ xử lý lỗi.
const handle = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Chỉ nhận các trường nhân viên được phép.
function getData(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new Error("Dữ liệu phải là một đối tượng JSON");
    error.status = 400;
    throw error;
  }

  const data = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      if (typeof body[field] !== "string") {
        const error = new Error(`${field} phải là chuỗi`);
        error.status = 400;
        throw error;
      }

      data[field] = body[field].trim();
    }
  }

  return data;
}

// Cho phép sử dụng _id của MongoDB hoặc mã như NV001.
function getFilter(id) {
  if (mongoose.isObjectIdOrHexString(id)) {
    return { _id: id };
  }

  return { employeeId: id.toUpperCase() };
}

// Danh sách và tìm kiếm nhân viên.
router.get(
  "/",
  handle(async (req, res) => {
    const search = String(req.query.search || "")
      .trim()
      .slice(0, 150);

    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const filter = search
      ? {
          $or: [
            { employeeId: regex },
            { fullName: regex }
          ]
        }
      : {};

    const employees = await Employee.find(filter)
      .sort({ employeeId: 1 });

    res.json(employees);
  })
);

// Xem chi tiết nhân viên.
router.get(
  "/:id",
  handle(async (req, res) => {
    const employee = await Employee.findOne(
      getFilter(req.params.id)
    );

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    res.json(employee);
  })
);

// Thêm nhân viên.
router.post(
  "/",
  handle(async (req, res) => {
    const employee = await Employee.create(getData(req.body));

    res.status(201).json({
      message: "Thêm nhân viên thành công",
      employee
    });
  })
);

// Cập nhật nhân viên.
router.put(
  "/:id",
  handle(async (req, res) => {
    const data = getData(req.body);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Chưa có dữ liệu cần cập nhật"
      });
    }

    const employee = await Employee.findOneAndUpdate(
      getFilter(req.params.id),
      { $set: data },
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    res.json({
      message: "Cập nhật nhân viên thành công",
      employee
    });
  })
);

// Xóa nhân viên.
router.delete(
  "/:id",
  handle(async (req, res) => {
    const employee = await Employee.findOneAndDelete(
      getFilter(req.params.id)
    );

    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên"
      });
    }

    res.json({
      message: "Xóa nhân viên thành công"
    });
  })
);

module.exports = router;