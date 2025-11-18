import React, { useRef, useState, useEffect } from "react";
import contractsApi from "../../api/contractsApi";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import moment from "moment";

interface ContractsListProps {
  data: any[];
  onView: (id: number) => void;
  reload?: () => void;
}

const ContractsList: React.FC<ContractsListProps> = ({ data, onView, reload }) => {
  const [contracts, setContracts] = useState(data);
  const [filters, setFilters] = useState({
    employee_id: "",
    dept_id: "",
    status: "",
    created_at: null as Date | null,
  });
  const [statusOptionsList, setStatusOptionsList] = useState<any[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  // Lấy thông tin người dùng từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isRole1 = user?.role_code === "role_1";
  const isHR = user?.role_code === "role_2" && user?.department_id === 1;
  const isSelf = user?.role_code === "role_2" || user?.role_code === "role_3";

  useEffect(() => setContracts(data), [data]);

  // ✅ Lấy danh sách phòng ban và trạng thái
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const statusRes = await contractsApi.getStatusOptions();
        setStatusOptionsList([{ label: "All Statuses", value: "" }, ...statusRes.data.data]);

        const deptRes = await contractsApi.getDepartments();
        setDepartmentOptions([
          { label: "All Departments", value: "" },
          ...deptRes.data.data.map((d: any) => ({
            label: d.value,
            value: String(d.id),
          })),
        ]);
      } catch (err) {
        console.error("Lỗi khi lấy trạng thái hợp đồng và phòng ban:", err);
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Không thể lấy dữ liệu bộ lọc!",
          life: 3000,
        });
      }
    };
    fetchOptions();
  }, []);

  const showToast = (
    severity: "success" | "error" | "warn" | "info",
    summary: string,
    detail: string
  ) => toast.current?.show({ severity, summary, detail, life: 3000 });

  // ✅ Tự động lọc hợp đồng khi thay đổi bộ lọc
  useEffect(() => {
    const handleSearch = async () => {
      try {
        const params: any = {};
        if (filters.employee_id) params.employee_id = filters.employee_id;
        if (filters.dept_id) params.dept_id = filters.dept_id;
        if (filters.status) params.status = filters.status;
        if (filters.created_at) {
          params.created_at = moment(filters.created_at).format("YYYY-MM-DD");
        }

        const res = await contractsApi.list(params);
        setContracts(res.data?.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi lọc hợp đồng:", err);
        showToast("error", "Lỗi", "Không thể tải danh sách hợp đồng!");
      }
    };

    // ⏳ debounce 300ms tránh gọi API liên tục khi nhập nhanh
    const delay = setTimeout(handleSearch, 300);
    return () => clearTimeout(delay);
  }, [filters]);

  // ✅ Hàm clear tất cả bộ lọc và tải lại dữ liệu gốc
  const handleClear = async () => {
    setFilters({
      employee_id: "",
      dept_id: "",
      status: "",
      created_at: null,
    });
    try {
      const res = await contractsApi.list({});
      setContracts(res.data?.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải lại dữ liệu:", err);
    }
  };

  // ✅ Đổi trạng thái hợp đồng
  const handleStatusChange = async (contractId: number, newStatus: string) => {
    if (!contractId) {
      showToast("error", "Lỗi", "Contract ID không hợp lệ!");
      return;
    }

    try {
      let message = "";
      if (newStatus === "approved") {
        await contractsApi.approve(contractId);
        message = "✅ Hợp đồng đã được phê duyệt.";
      } else if (newStatus === "sent_for_signing") {
        await contractsApi.sendForSigning(contractId);
        message = "📩 Hợp đồng đã được gửi để ký.";
      } else if (newStatus === "terminated") {
        const reason = prompt("Nhập lý do chấm dứt hợp đồng:");
        await contractsApi.terminate(contractId, reason || "Terminated manually");
        message = "⛔ Hợp đồng đã bị chấm dứt.";
      } else {
        showToast("info", "Thông báo", "Không thể đổi trạng thái này thủ công!");
        return;
      }

      setContracts(prev =>
        prev.map(item => (item.id === contractId ? { ...item, status: newStatus } : item))
      );

      showToast("success", "Thành công", message);
      reload?.();
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      let msg =
        err?.response?.data?.mes ||
        err?.response?.statusText ||
        err?.message ||
        "Lỗi không xác định!";
      if (msg.includes("No signers configured"))
        msg = "❗ Chưa cấu hình người ký.";
      if (msg.includes("Forbidden"))
        msg = "🚫 Bạn không có quyền thực hiện hành động này.";
      if (msg.includes("Invalid current status"))
        msg = "⚠️ Trạng thái hiện tại của hợp đồng không hợp lệ.";
      showToast("error", "Lỗi khi cập nhật", msg);
    }
  };

  return (
    <div className="overflow-auto" style={{ position: "relative" }}>
      <Toast ref={toast} />

      {/* 🔎 Bộ lọc tìm kiếm */}
      <div
        className="p-3 mb-3"
        style={{
          background: "#f8f9fa",
          borderRadius: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Hiển thị Mã nhân viên chỉ cho role_1 hoặc role_2 (HR) */}
        {(isRole1 || isHR) && (
          <InputText
            placeholder="Mã nhân viên"
            value={filters.employee_id}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                employee_id: e.target.value.toLowerCase(),
              }))
            }
          />
        )}

        {/* Hiển thị Phòng ban chỉ cho role_1 hoặc role_2 (HR) */}
        {(isRole1 || isHR) && (
          <Dropdown
            value={filters.dept_id}
            options={departmentOptions}
            onChange={(e) => setFilters((prev) => ({ ...prev, dept_id: e.value }))}
            placeholder="Phòng ban"
          />
        )}

        {/* Dropdown trạng thái luôn hiển thị */}
        <Dropdown
          value={filters.status}
          options={statusOptionsList}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.value }))}
          placeholder="Trạng thái"
        />

        {/* Calendar chọn ngày tạo luôn hiển thị */}
        <Calendar
          value={filters.created_at}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, created_at: e.value || null }))
          }
          placeholder="Ngày tạo"
          dateFormat="yy-mm-dd"
        />

        {/* Nút Clear */}
        <Button
          label="Clear"
          icon="pi pi-refresh"
          className="p-button-secondary"
          onClick={handleClear}
        />
      </div>

      {/* 📋 Bảng danh sách hợp đồng */}
      <table className="table" style={{ minWidth: 700 }}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th>Contract Code / Name</th>
            <th>Status</th>
            <th style={{ width: 180 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length ? (
            contracts.map((c: any) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.contract_code || c.name || "-"}</td>
                <td>
                  <select
                    title="Contract status"
                    value={c.status}
                    className="select-status"
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: "#f8f9fa",
                    }}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                  >
                    {statusOptionsList.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="p-button p-button-sm p-button-rounded p-button-info"
                    onClick={() => onView(Number(c.id))}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContractsList;
