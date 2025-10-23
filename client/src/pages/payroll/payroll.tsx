import "./payroll.scss";
import DefaultLayout from "../../layouts/DefaultLayout";
import { Card } from "primereact/card";
import { useEffect, useRef, useState } from "react";
import AxiosInstance from "../../services/axios";
import apiUrl from "../../constant/apiUrl";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";

type ChangeRow = {
  id: number;
  payroll_id: number;
  change_type: "status" | "data";
  description: string;
  changed_at?: string;
  // enrich từ BE
  employee_id?: string | null;
  employee_name?: string | null;
  department_id?: number | null;
  month?: string | null;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
};

const CHANGE_API = "/api/payroll-changes"; // endpoint cho lịch sử thay đổi

const Payroll = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast | null>(null);

  // ===== Auth & Role =====
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isRole1 = user?.role_code === "role_1";
  const isSelf = user?.role_code === "role_2" || user?.role_code === "role_3";

  // ===== State =====
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [q, setQ] = useState<string>("");               // search theo employee_id
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>(""); // rỗng = all

  // changes
  const [changes, setChanges] = useState<ChangeRow[]>([]);
  const [filteredChanges, setFilteredChanges] = useState<ChangeRow[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({}); // toggle details theo id

  // ===== Init =====
  useEffect(() => {
    if (isRole1) getDepartments();
    fetchPayrolls(); // gọi lần đầu, lấy full dữ liệu để lọc client-side
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== API =====
  const getDepartments = async () => {
    try {
      const res = await AxiosInstance.get(apiUrl.department.index);
      setDepartments(res?.data?.data || []);
    } catch (err) {
      console.error("Load departments error:", err);
    }
  };

  // Luôn fetch "full", không gửi params lọc -> lọc client-side tức thời
  const fetchPayrolls = async () => {
    try {
      let url = apiUrl.payroll.index;  // /api/payroll
      if (isSelf) {
        url = apiUrl.payroll.mine;     // /api/payroll/me  (role_2, role_3)
      }

      const result = await AxiosInstance.get(url);
      const rows = result?.data?.data || [];
      setPayrollData(rows);
      setFiltered(rows);

      // role_1: tải luôn change logs (full)
      if (isRole1) {
        await fetchChanges(); // full changes
      }
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load payroll data",
      });
    }
  };

  // tải lịch sử thay đổi (full cho role_1)
  const fetchChanges = async () => {
    if (!isRole1) return;
    try {
      const res = await AxiosInstance.get(CHANGE_API);
      const data = res?.data?.data || [];
      setChanges(data);
      setFilteredChanges(data); // sync lần đầu
    } catch (e) {
      console.error(e);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load payroll changes",
      });
    }
  };

  // ===== Client-side filter (để sync UI tức thời) - PAYROLL =====
  useEffect(() => {
    const t = setTimeout(() => {
      const keyword = q.trim().toLowerCase();
      let data = [...payrollData];

      if (monthFilter) data = data.filter(p => p.month === monthFilter);
      if (isRole1 && departmentFilter) {
        data = data.filter(p => Number(p.employee?.department_id) === Number(departmentFilter));
      }
      if (keyword && isRole1) {
        data = data.filter(p =>
          String(p.employee?.employee_id || "").toLowerCase().includes(keyword)
        );
      }

      setFiltered(data);
    }, 250);
    return () => clearTimeout(t);
  }, [q, monthFilter, departmentFilter, payrollData, isRole1]);

  // ===== Client-side filter (để sync UI tức thời) - CHANGES =====
  useEffect(() => {
    const t = setTimeout(() => {
      let data = [...changes];

      if (monthFilter) {
        data = data.filter(c => c.month === monthFilter);
      }
      if (isRole1 && departmentFilter) {
        data = data.filter(c => Number(c.department_id) === Number(departmentFilter));
      }
      if (isRole1 && q.trim()) {
        const kw = q.trim().toLowerCase();
        data = data.filter(c => String(c.employee_id || "").toLowerCase().includes(kw));
      }

      setFilteredChanges(data);
    }, 250);
    return () => clearTimeout(t);
  }, [changes, monthFilter, departmentFilter, q, isRole1]);

  const clearSearch = async () => {
    setQ("");
    setMonthFilter("");
    setDepartmentFilter("");
    setExpanded({});
    // Refetch để đảm bảo cả 2 bảng hiển thị "tất cả"
    await fetchPayrolls(); // (role_1) sẽ gọi fetchChanges() bên trong
  };

  // ===== Helpers =====
  const sortKeys = (obj?: Record<string, any> | null) => {
    if (!obj || typeof obj !== "object") return obj ?? {};
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
    const out: Record<string, any> = {};
    keys.forEach(k => (out[k] = obj[k]));
    return out;
  };
  const prettyJSON = (obj?: Record<string, any> | null) =>
    JSON.stringify(sortKeys(obj), null, 2);

  const toggleExpand = (id: number) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ===== Render =====
  return (
    <DefaultLayout>
      <Toast ref={toast} />
      <h2 className="section-title">Payroll</h2>

      <Card style={{ marginBottom: 12, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {/* Search theo Employee ID (role_1) */}
          {isRole1 && (
            <InputText
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by Employee ID (e.g., AD0001)"
              disabled={!isRole1}
            />
          )}

          {/* Department: chỉ hiện với role_1 */}
          {isRole1 ? (
            <select
              value={departmentFilter}
              aria-label="Select Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            >
              <option value="">All departments</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>{d.value}</option>
              ))}
            </select>
          ) : (
            <div />  // giữ layout 4 cột
          )}

          {/* Month */}
          <InputText
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />

          {/* Buttons: bỏ Search, chỉ còn Clear */}
          <div style={{ display: "flex", gap: 8 }}>
            <Button label="Clear" className="p-button-secondary" onClick={clearSearch} />
          </div>
        </div>
      </Card>

      {/* ===== BẢNG LỊCH SỬ THAY ĐỔI (role_1) - HIỂN THỊ CŨ CÓ DETAILS ===== */}
      {isRole1 && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Payroll Changes</h3>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee ID</th>
                <th>Payroll ID</th>
                <th>Month</th>
                <th>Change Type</th>
                <th>Description</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredChanges.length ? (
                filteredChanges.map((c, idx) => (
                  <Fragment key={c.id}>
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{c.employee_id ?? "-"}</td>
                      <td>{c.payroll_id}</td>
                      <td>{c.month ?? "-"}</td>
                      <td>{c.change_type}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{c.description}</td>
                      <td>
                        <Button
                          label={expanded[c.id] ? "Hide" : "Details"}
                          className="p-button-text p-button-sm"
                          onClick={() => toggleExpand(c.id)}
                        />
                      </td>
                    </tr>

                    {expanded[c.id] && (
                      <>
                        <tr key={`old-${c.id}`}>
                          <td colSpan={7}>
                            <strong>Old data</strong>
                            <pre style={{ marginTop: 6 }}>
                              {prettyJSON(c.old_data as Record<string, any>)}
                            </pre>
                          </td>
                        </tr>
                        <tr key={`new-${c.id}`}>
                          <td colSpan={7}>
                            <strong>New data</strong>
                            <pre style={{ marginTop: 6 }}>
                              {prettyJSON(c.new_data as Record<string, any>)}
                            </pre>
                          </td>
                        </tr>
                      </>
                    )}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    No change logs
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* ===== BẢNG LƯƠNG ===== */}
      <div className="payroll-table">
        <Card>
          <h3 style={{ margin: 0, marginBottom: 8 }}>Payroll</h3>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Basic Salary</th>
                <th>Total Work Hours</th>
                <th>Absent Days</th>
                <th>Actual Salary</th>
                <th>OT Weekday Hours</th>
                <th>OT Weekend Hours</th>
                <th>OT Holiday Hours</th>
                <th>Overtime Amount</th>
                <th>Allowance</th>
                <th>Total Amount</th>
                <th>Deduction</th>
                <th>Received Salary</th>
                <th>Month</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((item, index) => (
                  <tr key={`${item.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{item.employee?.employee_id}</td>
                    <td>{item.employee?.full_name}</td>
                    <td>{item.employee?.department?.value}</td>
                    <td>{item.employee?.position?.value}</td>
                    <td>{item.employee?.basic_salary}</td>
                    <td>{item.total_work_hours}</td>
                    <td>{item.absent_days}</td>
                    <td>{item.actual_salary}</td>
                    <td>{item.ot_weekday_hours}</td>
                    <td>{item.ot_weekend_hours}</td>
                    <td>{item.ot_holiday_hours}</td>
                    <td>{item.overtime_amount}</td>
                    <td>{item.allowance}</td>
                    <td>{item.total_amount}</td>
                    <td>{item.deduction}</td>
                    <td>{item.received_salary}</td>
                    <td>{item.month}</td>
                    <td>
                      <span className={`badge ${item.status === "approved" ? "badge--ok" : "badge--draft"}`}>
                        {item.status ?? "draft"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={19} style={{ textAlign: "center" }}>
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

export default Payroll;
