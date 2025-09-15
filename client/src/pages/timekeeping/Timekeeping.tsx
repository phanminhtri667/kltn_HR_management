import "./timekeeping.scss";
import DefaultLayout from "../../layouts/DefaultLayout";
import { Card } from "primereact/card";
import { useEffect, useRef, useState } from "react";
import workingHoursApi from "../../api/workingHoursApi";
import timekeepingApi, { TimekeepingFilters } from "../../api/timekeepingApi";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import AxiosInstance from "../../services/axios";
import apiUrl from "../../constant/apiUrl";

const Timekeeping = () => {
  const [workingHours, setWorkingHours] = useState<any>(null);

  // dữ liệu bảng chấm công
  const [timekeepingData, setTimekeepingData] = useState<any[]>([]);

  // danh sách phòng ban để render dropdown
  const [departments, setDepartments] = useState<any[]>([]);

  // filters
  const [employeeId, setEmployeeId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    getWorkingHours();
    getDepartments();
    load(); // lần đầu load tất cả
  }, []);

  // tự động load khi filter thay đổi (debounce 300ms)
  useEffect(() => {
    const h = setTimeout(() => load(), 300);
    return () => clearTimeout(h);
  }, [employeeId, departmentId, dateFrom, dateTo]);

  const getDepartments = async () => {
    try {
      const res = await AxiosInstance.get(apiUrl.department.index);
      setDepartments(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getWorkingHours = async () => {
    try {
      const res = await workingHoursApi.get();
      setWorkingHours(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const params: TimekeepingFilters = {
        employee_id: employeeId.trim() || undefined,
        department_id: departmentId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };
      const res = await timekeepingApi.list(params);
      // service list trả { err, data }
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

  const handleUpdateWorkingHours = async () => {
    try {
      if (workingHours) {
        await workingHoursApi.update(workingHours);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Working hours updated successfully",
        });
        getWorkingHours();
      }
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update working hours",
      });
    }
  };

  const clearFilters = () => {
    setEmployeeId("");
    setDepartmentId("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <DefaultLayout>
      <Toast ref={toast} />

      {/* Working hours config */}
      <h2 className="section-title">Working Hours</h2>
      <Card className="form-card">
        {workingHours && (
          <div className="form-inline">
            <div className="form-group">
              <label>Start Time</label>
              <InputText
                type="time"
                value={workingHours.start_time}
                onChange={(e) =>
                  setWorkingHours({ ...workingHours, start_time: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <InputText
                type="time"
                value={workingHours.end_time}
                onChange={(e) =>
                  setWorkingHours({ ...workingHours, end_time: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Grace Period (minutes)</label>
              <InputText
                type="number"
                value={workingHours.grace_period}
                onChange={(e) =>
                  setWorkingHours({
                    ...workingHours,
                    grace_period: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="btn-container">
              <Button
                label="Update"
                onClick={handleUpdateWorkingHours}
                className="btn-update"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Filters */}
      <h2 style={{ marginTop: "40px" }}>Employee Timekeeping</h2>
      <Card style={{ marginBottom: 12, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr auto", gap: 12 }}>
          {/* Employee ID */}
          <InputText
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Search by Employee ID (e.g., AD0001)"
          />

          {/* Department */}
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
          >
            <option value="">All departments</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.value}
              </option>
            ))}
          </select>

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

      {/* Timekeeping table */}
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
              {timekeepingData.length ? (
                timekeepingData.map((item, index) => {
                  // service list alias work_date -> 'date'. fallback cho trường hợp getAll cũ.
                  const dateStr = (item.date || item.work_date || "").toString();
                  const dateShort = dateStr ? dateStr.slice(0, 10) : "-";
                  return (
                    <tr key={`${item.id}-${index}`}>
                      <td>{index + 1}</td>
                      <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                        {item.employee?.employee_id}
                      </td>
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
