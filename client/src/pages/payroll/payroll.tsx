import "./payroll.scss";
import DefaultLayout from "../../layouts/DefaultLayout";
import { Card } from "primereact/card";
import { useEffect, useRef, useState } from "react";
import AxiosInstance from "../../services/axios";
import apiUrl from "../../constant/apiUrl";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const Payroll = () => {
  const [payrollData, setPayrollData] = useState<any[]>([]);  // Dữ liệu bảng lương
  const [filtered, setFiltered] = useState<any[]>([]);        // Dữ liệu đã lọc
  const [q, setQ] = useState<string>("");                     // Tìm kiếm theo Employee ID
  const [departmentFilter, setDepartmentFilter] = useState<string>("All departments");  // Lọc theo phòng ban
  const [monthFilter, setMonthFilter] = useState<string>("");  // Lọc theo tháng

  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    getPayrolls();  // Lấy tất cả bảng lương khi tải trang
  }, []);

  // Lọc bảng lương khi các bộ lọc thay đổi
  useEffect(() => {
    const h = setTimeout(() => {
      const keyword = q.trim().toLowerCase();
      let filteredData = payrollData;

      // Lọc theo tháng nếu có
      if (monthFilter) {
        filteredData = filteredData.filter(
          (payroll) => payroll.month === monthFilter
        );
      }

      // Lọc theo phòng ban nếu có
      if (departmentFilter && departmentFilter !== "All departments") {
        filteredData = filteredData.filter(
          (payroll) => payroll.employee.department_id === departmentFilter
        );
      }

      // Lọc theo Employee ID
      if (keyword) {
        filteredData = filteredData.filter((payroll) =>
          String(payroll.employee.employee_id || "")
            .toLowerCase()
            .includes(keyword)
        );
      }

      setFiltered(filteredData);
    }, 300); // Debounce filter change with 300ms delay
    return () => clearTimeout(h);
  }, [q, monthFilter, departmentFilter, payrollData]);

  const getPayrolls = async () => {
    try {
      const result = await AxiosInstance.get(apiUrl.payroll.index);  // Lấy bảng lương từ API
      if (result.data) {
        const rows = result.data.data || [];
        setPayrollData(rows);
        setFiltered(rows);  // Đồng bộ dữ liệu ban đầu cho bảng
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

  const clearSearch = () => {
    setQ("");
    setMonthFilter("");
    setDepartmentFilter("All departments");
    setFiltered(payrollData);
  };

  return (
    <>
      <DefaultLayout>
        <Toast ref={toast} />

        {/* Thanh tìm kiếm */}
        <h2 className="section-title">Payroll</h2>
        

        {/* Các bộ lọc */}
        <Card style={{ marginBottom: 12, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            {/* Bộ lọc theo Employee ID */}
            <InputText
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by Employee ID (e.g., AD0001)"
            />

            {/* Bộ lọc phòng ban */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            >
              <option value="All departments">All departments</option>
              {/* Lấy các phòng ban từ API */}
              <option value="1">Sales</option>
              <option value="2">Engineering</option>
              <option value="3">HR</option>
              {/* Thêm các phòng ban ở đây */}
            </select>

            {/* Bộ lọc tháng */}
            <InputText
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />

            {/* Nút tìm kiếm và xóa */}
            <div style={{ display: "flex", gap: 8 }}>
              <Button label="Search" onClick={getPayrolls} />
              <Button label="Clear" className="p-button-secondary" onClick={clearSearch} />
            </div>
          </div>
        </Card>

        {/* Hiển thị bảng lương */}
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
                  filtered.map((item, index) => {
                    return (
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
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={13} style={{ textAlign: "center" }}>
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </DefaultLayout>
    </>
  );
};

export default Payroll;
