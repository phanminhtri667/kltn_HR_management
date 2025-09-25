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

  useEffect(() => {
    load(); // Lần đầu load tất cả
    getDepartments(); // Lấy danh sách phòng ban
  }, []); // Khi component mount

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
      } else if (user?.role_code === "role_2") {
        // Nếu là quản lý, lấy dữ liệu của phòng ban
        res = await timekeepingApi.getByDepartment(user.department_id);
      } else {
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

  // ===== Render =====
  return (
    <DefaultLayout>
      <Toast ref={toast} />
      <h2 className="section-title">Employee Timekeeping</h2>

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
