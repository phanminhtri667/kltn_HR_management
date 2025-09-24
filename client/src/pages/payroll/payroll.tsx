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
  const [q, setQ] = useState<string>("");               // search theo employee_id (mã)
  const [monthFilter, setMonthFilter] = useState<string>("");

  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>(""); // rỗng = all

  // ===== Init =====
  useEffect(() => {
    if (isRole1) getDepartments();
    fetchPayrolls(); // gọi theo role
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

  const fetchPayrolls = async () => {
    try {
      let url = apiUrl.payroll.index;  // /api/payroll
      const params: any = {};

      if (isSelf) {
        url = apiUrl.payroll.mine;     // /api/payroll/me  (role_2, role_3)
        if (monthFilter) params.month = monthFilter;
      } else if (isRole1) {
        if (monthFilter) params.month = monthFilter;
        if (departmentFilter) params.department_id = Number(departmentFilter);
        if (q.trim()) params.employee_id = q.trim(); // server-side search theo employee_id
      }

      const result = await AxiosInstance.get(url, { params });
      const rows = result?.data?.data || [];
      setPayrollData(rows);
      setFiltered(rows);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load payroll data",
      });
    }
  };

  // ===== Client-side filter (để sync UI tức thời) =====
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

  const clearSearch = () => {
    setQ("");
    setMonthFilter("");
    setDepartmentFilter("");
    setFiltered(payrollData);
  };

  // ===== Render =====
  return (
    <DefaultLayout>
      <Toast ref={toast} />
      <h2 className="section-title">Payroll</h2>

      <Card style={{ marginBottom: 12, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {/* Search theo Employee ID (role_1) */}
          <InputText
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Employee ID (e.g., AD0001)"
            disabled={!isRole1}
            onKeyDown={(e) => e.key === "Enter" && fetchPayrolls()}
          />

          {/* Department: chỉ hiện với role_1 */}
          {isRole1 ? (
            <select
              value={departmentFilter}
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
            onBlur={fetchPayrolls}
          />

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <Button label="Search" onClick={fetchPayrolls} />
            <Button label="Clear" className="p-button-secondary" onClick={clearSearch} />
          </div>
        </div>
      </Card>

      <div className="payroll-table">
        <Card>
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
                <th>Actual Salary</th>
                <th>Overtime Amount</th>
                <th>Allowance</th>
                <th>Total Amount</th>
                <th>Deduction</th>
                <th>Received Salary</th>
                <th>Month</th>
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
                    <td>{item.actual_salary}</td>
                    <td>{item.overtime_amount}</td>
                    <td>{item.allowance}</td>
                    <td>{item.total_amount}</td>
                    <td>{item.deduction}</td>
                    <td>{item.received_salary}</td>
                    <td>{item.month}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} style={{ textAlign: "center" }}>
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
