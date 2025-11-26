import "./timekeeping.scss";
import DefaultLayout from "../../layouts/DefaultLayout";
import { Card } from "primereact/card";
import { useEffect, useRef, useState } from "react";
import timekeepingApi, { TimekeepingFilters } from "../../api/timekeepingApi"; // Import API
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import AxiosInstance from "../../services/axios";
import apiUrl from "../../constant/apiUrl";
import { Dialog } from "primereact/dialog";

const Timekeeping = () => {
  const { user } = useSelector((state: RootState) => state.auth); // Lấy thông tin người dùng từ Redux
  const toast = useRef<Toast | null>(null);

  // ===== State =====
  const [timekeepingData, setTimekeepingData] = useState<any[]>([]); // Dữ liệu bảng chấm công
  const [filtered, setFiltered] = useState<any[]>([]); // Dữ liệu đã lọc
  const [employeeId, setEmployeeId] = useState<string>(""); // Nhân viên ID
  const [departmentId, setDepartmentId] = useState<string>(""); // Phòng ban
  const [dateFrom, setDateFrom] = useState<string>(""); // Ngày từ
  const [dateTo, setDateTo] = useState<string>(""); // Ngày đến
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [departments, setDepartments] = useState<any[]>([]); // Danh sách phòng ban

  // ===== NEW: State cho check in/out và đồng hồ =====
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);

  const [summary, setSummary] = useState({
    totalHours: 0,
    ot: 0,
    lateMinutes: 0,
    leave: 0,
  });

  useEffect(() => {
    load(); 
    getDepartments();
    loadSummary();  
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tự động load khi filter thay đổi (debounce 300ms)
  useEffect(() => {
    const h = setTimeout(() => load(), 300);
    return () => clearTimeout(h);
  }, [employeeId, departmentId, dateFrom, dateTo]);

  // ===== API Fetch =====
  const load = async () => {
    try {
      setLoading(true);
      const params: TimekeepingFilters = {
        employee_id: user?.role_code === "role_3" ? user.employee_id : employeeId.trim() || undefined,
        department_id: user?.role_code === "role_2" ? user.department_id : departmentId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      let res;
      if (user?.role_code === "role_3") {
        // Nếu là nhân viên, lấy chỉ dữ liệu của chính họ
        res = await timekeepingApi.list({ employee_id: user.employee_id, ...params });
      } 
      else if (user?.role_code === "role_2") {
        // Nếu là quản lý HR (phòng ban 1) → thấy toàn bộ
        if (user.department_id === 1) {
          res = await timekeepingApi.getAll();
        } else {
          // Các phòng khác chỉ thấy nhân viên trong phòng ban của mình
          res = await timekeepingApi.getByDepartment(user.department_id);
        }
      }
      else {
        // Admin (role_1), lấy tất cả chấm công
        res = await timekeepingApi.getAll();
      }

      setTimekeepingData(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Load timekeeping failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== Client-side filter (để sync UI tức thời) =====
  useEffect(() => {
    const t = setTimeout(() => {
      let data = [...timekeepingData];

      // Tìm kiếm không phân biệt hoa thường
      if (employeeId) data = data.filter(p => String(p.employee?.employee_id || "").toLowerCase().includes(employeeId.toLowerCase()));
      if (departmentId) data = data.filter(p => String(p.employee?.department_id || "").includes(departmentId));
      if (dateFrom) data = data.filter(p => p.date >= dateFrom);
      if (dateTo) data = data.filter(p => p.date <= dateTo);

      setFiltered(data);
    }, 250);

    return () => clearTimeout(t);
  }, [employeeId, departmentId, dateFrom, dateTo, timekeepingData]);

  // ===== Get departments =====
  const getDepartments = async () => {
    try {
      const res = await AxiosInstance.get(apiUrl.department.index);
      setDepartments(res?.data?.data || []);
    } catch (err) {
      console.error("Load departments error:", err);
    }
  };

  const clearFilters = () => {
    setEmployeeId("");
    setDepartmentId("");
    setDateFrom("");
    setDateTo("");
    setFiltered(timekeepingData);
  };

  // ===== NEW: Handle Check In / Check Out =====
  useEffect(() => {
    const initCheckState = async () => {
      try {
        if (!user?.employee_id) return;
        const today = nowDate();
        // lấy chấm công của chính mình trong ngày
        const res = await AxiosInstance.get(`${apiUrl.timekeeping.mine}?date_from=${today}&date_to=${today}`);
        const rows = res?.data?.data || [];
        const todayRec = rows.find((r: any) => r.work_date?.slice(0,10) === today || r.date?.slice(0,10) === today);
        setIsCheckedIn(!!(todayRec && todayRec.check_in && !todayRec.check_out));
      } catch (e) {
        console.log("init state failed", e);
      }
    };
    initCheckState();
  }, [user]);
  
  const pad = (n: number) => String(n).padStart(2, "0");
  const nowDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const nowTime = () => {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  const handleCheck = async () => {
    try {
      if (!user?.employee_id) {
        toast.current?.show({ severity: "warn", summary: "Không có employee_id trong token" });
        return;
      }
  
      const payload = {
        employee_id: user.employee_id,
        work_date: nowDate(),
        ...(isCheckedIn ? { check_out: nowTime() } : { check_in: nowTime() }),
      };
  
      const endpoint = isCheckedIn ? apiUrl.timekeeping.checkOut : apiUrl.timekeeping.checkIn;
      await AxiosInstance[isCheckedIn ? "patch" : "post"](endpoint, payload);
  
      toast.current?.show({
        severity: "success",
        summary: isCheckedIn ? "Check Out thành công" : "Check In thành công",
      });
  
      setIsCheckedIn(!isCheckedIn);
      load();        
      loadSummary(); 
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err?.response?.data?.mes || "Thao tác thất bại",
      });
    }
  };
  
  const getCurrentMonth = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // ví dụ: '2025-11'
  };

  const loadSummary = async () => {
    try {
      const month = getCurrentMonth();
      const res = await timekeepingApi.getSummary(month);
      const data = res?.data?.data || {};

      setSummary({
        totalHours: data.totalHours || 0,
        ot: data.ot || 0,
        lateMinutes: data.lateMinutes || 0,
        leave: data.leave || 0,
      });
    } catch (err) {
      console.error("Load summary error:", err);
      // có thể show toast nhẹ nếu muốn
    }
  };

// popup xin nghỉ phép
// Thêm state cho popup form xin nghỉ phép
const [showLeaveForm, setShowLeaveForm] = useState(false);
const [leaveFormData, setLeaveFormData] = useState({
  reason: '',
  startDate: '',
  endDate: '',
});
const [departmentName, setDepartmentName] = useState("");
// lấy tên phòng ban
useEffect(() => {
  const fetchDepartmentName = async () => {
    try {
      if (user?.department_id) {
        const res = await AxiosInstance.get(apiUrl.department.index);
        const dept = res.data.data.find((d: any) => d.id === user.department_id);
        if (dept) setDepartmentName(dept.value);
      }
    } catch (err) {
      console.error("Error fetching department name:", err);
    }
  };

  fetchDepartmentName();
}, [user]);
//xử lý  logic tạo đon xin ngỉ phép
const handleSubmitLeave = async () => {
  try {
    const start = new Date(leaveFormData.startDate);
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    // 1️⃣ Không được xin nghỉ ngày quá khứ hoặc hôm nay
    if (start <= now) {
      toast.current?.show({
        severity: "warn",
        summary: "Không thể xin nghỉ trong quá khứ hoặc hôm nay",
      });
      return;
    }

    // 2️⃣ Nếu xin nghỉ ngày kế tiếp → phải tạo trước 17h hôm nay
    const isTomorrow = start.toDateString() === tomorrow.toDateString();
    const hour = now.getHours();

    if (isTomorrow && hour >= 17) {
      toast.current?.show({
        severity: "error",
        summary: "Đã quá 17h, không thể xin nghỉ cho ngày mai",
      });
      return;
    }

    const payload = {
      employee_id: user.employee_id,
      department_id: user.department_id,
      type_id: 1,
      start_date: leaveFormData.startDate,
      end_date: leaveFormData.endDate,
      reason: leaveFormData.reason,
    };

    const res = await AxiosInstance.post(apiUrl.leave.create, payload);

    toast.current?.show({
      severity: "success",
      summary: res.data.mes || "Tạo đơn nghỉ thành công",
    });

    setShowLeaveForm(false);
  } catch (err: any) {
    console.error("❌ Submit error:", err);
    const message =
      err?.response?.data?.mes ||
      err?.message ||
      "Gửi đơn nghỉ thất bại";

    toast.current?.show({
      severity: "error",
      summary: message,
    });
  }
};




  // ===== Render =====
  return (
    <DefaultLayout>
      <Toast ref={toast} />
      <h2 className="section-title">Employee Timekeeping</h2>

      {/* NEW: Khu vực chấm công + tổng quan */}
      {/* NEW: Khu vực chấm công + tổng quan */}
      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        {/* Card Chấm Công */}
        <Card className="card-timekeeping" style={{ flex: 1 }}>
          <h3>Chấm Công</h3>
          <div className="time-display">{currentTime}</div>
          <div className="date-display">{new Date().toLocaleDateString()}</div>

          <div className="btn-group">
            {(user?.role_code === "role_2" || user?.role_code === "role_3") && (
              <Button
              label={isCheckedIn ? "Check Out" : "Check In"}
              className={`btn-check ${isCheckedIn ? "check-out" : "check-in"}`}
              onClick={handleCheck}
              />
            )}
            {(user?.role_code === "role_2" || user?.role_code === "role_3") && (
              <Button
                label="Xin Nghỉ"
                className="btn-leave"
                onClick={() => setShowLeaveForm(true)}
              />
            )}
          </div>
        </Card>
        <Dialog
          header="Đơn Xin Phép"
          visible={showLeaveForm}
          onHide={() => setShowLeaveForm(false)} // Đóng form khi nhấn nút Close
          style={{ width: "50vw" }}
        >
          <div>
            <div className="p-field">
              <label htmlFor="fullName">Họ Tên:</label>
              <InputText
                id="fullName"
                value={user?.name} // Hiển thị họ tên người xin nghỉ
                disabled
              />
            </div>

            <div className="p-field">
              <label htmlFor="department">Phòng Ban:</label>
              <InputText
                id="department"
                value={departmentName || ""} // Hiển thị phòng ban
                disabled
              />
            </div>

            <div className="p-field">
              <label htmlFor="startDate">Ngày Bắt Đầu:</label>
              <InputText
                id="startDate"
                type="date"
                value={leaveFormData.startDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
              />
            </div>

            <div className="p-field">
              <label htmlFor="endDate">Ngày Kết Thúc:</label>
              <InputText
                id="endDate"
                type="date"
                value={leaveFormData.endDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
              />
            </div>

            <div className="p-field">
              <label htmlFor="reason">Lý Do:</label>
              <InputText
                id="reason"
                value={leaveFormData.reason}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                placeholder="Nhập lý do nghỉ"
              />
            </div>

            <div className="p-d-flex p-jc-between">
              <Button
                label="Cancel"
                className="p-button-secondary"
                onClick={() => setShowLeaveForm(false)} // Đóng form khi nhấn nút Cancel
              />
              
              <Button
                label="Submit"
                onClick={handleSubmitLeave} // ✅ Gọi hàm bạn đã viết
              />

            </div>
          </div>
        </Dialog>


        {/* Card Tổng Quan */}
        <Card className="card-summary" style={{ flex: 1 }}>
          <h3>Tổng Quan</h3>
          <div className="summary-list">
            <div className="label">Tổng Giờ :</div>
            <div className="value">{summary.totalHours}</div>

            <div className="label">OT:</div>
            <div className="value">{summary.ot}</div>

            <div className="label">Đi Muộn:</div>
            <div className="value">{summary.lateMinutes} phút</div>

            <div className="label">Vắng/Phép:</div>
            <div className="value">{summary.leave}</div>
          </div>
          
        </Card>
      </div>


      {/* Bộ lọc */}
      <Card style={{ marginBottom: 12, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12 }}>
          {/* Employee ID (Search by Employee ID) */}
          {(user?.role_code === "role_1" || user?.role_code === "role_2") && (
            <InputText
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Search by Employee ID (e.g., AD0001)"
              onKeyDown={(e) => e.key === "Enter" && load()}
              disabled={user?.role_code === "role_3"} // Ẩn cho role 3
            />
          )}

          {/* Department (Search by Department) */}
          {(user?.role_code === "role_1" || user?.role_code === "role_2") && (
            <select
              value={user?.role_code === "role_2" ? user.department_id : departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
              disabled={user?.role_code === "role_2"} // Disabled for role_2
            >
              <option value="">All departments</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>{d.value}</option>
              ))}
            </select>
          )}

          {/* Date from */}
          <InputText
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />

          {/* Date to */}
          <InputText
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <Button label={loading ? "Loading..." : "Search"} onClick={load} />
            <Button label="Clear" className="p-button-secondary" onClick={clearFilters} />
          </div>
        </div>
      </Card>

      <div className="employee-table">
        <Card>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((item, index) => {
                  const dateStr = (item.date || item.work_date || "").toString();
                  const dateShort = dateStr ? dateStr.slice(0, 10) : "-";
                  return (
                    <tr key={`${item.id}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{item.employee?.employee_id}</td>
                      <td>{item.employee?.full_name}</td>
                      <td>{item.employee?.department?.value}</td>
                      <td>{dateShort}</td>
                      <td>{item.check_in || "-"}</td>
                      <td>{item.check_out || "-"}</td>
                      <td>{item.total_hours ?? 0}</td>
                      <td>{item.status || "normal"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center" }}>
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default Timekeeping;
