import { useEffect, useState } from "react";

const emptyForm = {
  employeeId: "",
  fullName: "",
  gender: "Nam",
  dateOfBirth: "",
  department: "",
  position: "",
  email: "",
  phone: "",
  hireDate: "",
  status: "Đang làm việc"
};

const inputFields = [
  ["employeeId", "Mã nhân viên", "text", true],
  ["fullName", "Họ và tên", "text", true],
  ["dateOfBirth", "Ngày sinh", "date", false],
  ["department", "Phòng ban", "text", false],
  ["position", "Chức vụ", "text", false],
  ["email", "Email", "email", true],
  ["phone", "Số điện thoại", "tel", false],
  ["hireDate", "Ngày vào làm", "date", false]
];

const detailFields = [
  ["employeeId", "Mã nhân viên"],
  ["fullName", "Họ và tên"],
  ["gender", "Giới tính"],
  ["dateOfBirth", "Ngày sinh"],
  ["department", "Phòng ban"],
  ["position", "Chức vụ"],
  ["email", "Email"],
  ["phone", "Số điện thoại"],
  ["hireDate", "Ngày vào làm"],
  ["status", "Trạng thái"]
];

async function request(url, options = {}) {
  const response = await fetch(url, options);

  const data = await response.json().catch(() => {
    throw new Error("Backend trả về dữ liệu không hợp lệ");
  });

  if (!response.ok) {
    throw new Error(data.message || `Lỗi HTTP ${response.status}`);
  }

  return data;
}

export default function App() {
  const apiBase = (
    window.APP_CONFIG?.API_URL ||
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:5001"
  ).replace(/\/+$/, "");

  const api = `${apiBase}/api/employees`;

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const busy = loading || saving;

  async function loadEmployees(keyword = "") {
    setLoading(true);

    try {
      const data = await request(
        `${api}?search=${encodeURIComponent(keyword)}`
      );

      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees().catch((err) => setError(err.message));
    // Chỉ tải danh sách lần đầu khi mở giao diện.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  async function submitForm(event) {
    event.preventDefault();

    if (busy) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await request(
        editingId ? `${api}/${editingId}` : api,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      resetForm();
      setDetail(null);
      setMessage(result.message);

      try {
        await loadEmployees(search);
      } catch (err) {
        setError(
          `Đã lưu nhưng chưa tải lại được danh sách: ${err.message}`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function searchEmployees(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    try {
      await loadEmployees(search);
    } catch (err) {
      setError(err.message);
    }
  }

  async function openEmployee(id, edit = false) {
    setError("");
    setMessage("");

    try {
      const employee = await request(`${api}/${id}`);

      if (edit) {
        const values = { ...emptyForm };

        for (const key of Object.keys(emptyForm)) {
          values[key] = employee[key] ?? emptyForm[key];
        }

        setForm(values);
        setEditingId(employee._id);
        setDetail(null);

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      } else {
        setDetail(employee);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteEmployee(employee) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ${employee.fullName} (${employee.employeeId})?`
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await request(`${api}/${employee._id}`, {
        method: "DELETE"
      });

      if (editingId === employee._id) resetForm();

      setDetail(null);
      setMessage(result.message);

      try {
        await loadEmployees(search);
      } catch (err) {
        setError(
          `Đã xóa nhưng chưa tải lại được danh sách: ${err.message}`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container">
      <header className="header">
        <h1>HỆ THỐNG QUẢN LÝ NHÂN SỰ</h1>
        <p>Nguyễn Anh Huy — MSSV: 237529</p>
        <p>Học phần Điện toán đám mây</p>
      </header>

      {message && (
        <div className="alert success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      <section className="card">
        <h2>
          {editingId ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        </h2>

        <form onSubmit={submitForm}>
          <fieldset disabled={busy}>
            <div className="form-grid">
              {inputFields.map(([name, label, type, required]) => (
                <label key={name}>
                  {label}{required ? " *" : ""}

                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={changeField}
                    required={required}
                  />
                </label>
              ))}

              <label>
                Giới tính

                <select
                  name="gender"
                  value={form.gender}
                  onChange={changeField}
                >
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </label>

              <label>
                Trạng thái

                <select
                  name="status"
                  value={form.status}
                  onChange={changeField}
                >
                  <option>Đang làm việc</option>
                  <option>Tạm nghỉ</option>
                  <option>Đã nghỉ việc</option>
                </select>
              </label>
            </div>

            <div className="actions">
              <button type="submit">
                {saving
                  ? "Đang xử lý..."
                  : editingId
                    ? "Lưu thay đổi"
                    : "Thêm nhân viên"}
              </button>

              <button
                type="button"
                className="secondary"
                onClick={resetForm}
              >
                {editingId ? "Hủy chỉnh sửa" : "Làm mới biểu mẫu"}
              </button>
            </div>
          </fieldset>
        </form>
      </section>

      <section className="card">
        <h2>Danh sách nhân viên</h2>

        <form className="search" onSubmit={searchEmployees}>
          <input
            aria-label="Tìm nhân viên"
            placeholder="Nhập mã nhân viên hoặc họ tên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit" disabled={busy}>
            Tìm kiếm
          </button>
        </form>

        {loading ? (
          <p role="status">Đang tải danh sách nhân viên...</p>
        ) : (
          <>
            <p>Số nhân viên hiển thị: {employees.length}</p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã NV</th>
                    <th>Họ và tên</th>
                    <th>Phòng ban</th>
                    <th>Chức vụ</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        Không có nhân viên phù hợp.
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee._id}>
                        <td>{employee.employeeId}</td>
                        <td>{employee.fullName}</td>
                        <td>{employee.department}</td>
                        <td>{employee.position}</td>
                        <td>{employee.email}</td>
                        <td>{employee.phone}</td>
                        <td>{employee.status}</td>

                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                openEmployee(employee._id)
                              }
                            >
                              Xem
                            </button>

                            <button
                              type="button"
                              className="secondary"
                              disabled={busy}
                              onClick={() =>
                                openEmployee(employee._id, true)
                              }
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              className="danger"
                              disabled={busy}
                              onClick={() =>
                                deleteEmployee(employee)
                              }
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {detail && (
        <section className="card">
          <h2>Chi tiết nhân viên</h2>

          <dl className="details">
            {detailFields.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{detail[key] || "Chưa cập nhật"}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => setDetail(null)}
          >
            Đóng chi tiết
          </button>
        </section>
      )}
    </main>
  );
}