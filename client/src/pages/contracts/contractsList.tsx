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

type Filters = {
  employee_id: string;
  dept_id: string;
  status: string;
  created_at: Date | null;
  expiring: boolean;
};

const ContractsList: React.FC<ContractsListProps> = ({ data, onView }) => {
  const [contracts, setContracts] = useState(data);

  // ============================
  // FILTER STATE
  // ============================
  const [filters, setFilters] = useState<Filters>({
    employee_id: "",
    dept_id: "",
    status: "",
    created_at: null,
    expiring: false,
  });

  const [statusOptionsList, setStatusOptionsList] = useState<any[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isRole1 = user?.role_code === "role_1";
  const isHR = user?.role_code === "role_2" && user?.department_id === 1;
  const isDeptManager = user?.role_code === "role_2" && user?.department_id !== 1;

  useEffect(() => setContracts(data), [data]);

  // ============================
  // LOAD FILTER OPTIONS
  // ============================
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

  const showToast = (severity: any, summary: string, detail: string) =>
    toast.current?.show({ severity, summary, detail, life: 3000 });

  // ============================
  // API FILTERING
  // ============================
  useEffect(() => {
    const handleSearch = async () => {
      try {
        const params: any = {};

        if (filters.employee_id) params.employee_id = filters.employee_id;
        if (filters.status) params.status = filters.status;

        if (filters.created_at) {
          params.created_at = moment(filters.created_at).format("YYYY-MM-DD");
        }

        if (filters.expiring) params.expiring = true;

        if (filters.dept_id && (isRole1 || isHR)) params.dept_id = filters.dept_id;
        if (isDeptManager) params.dept_id = user.department_id;

        const res = await contractsApi.list(params);
        setContracts(res.data?.data || []);
      } catch (err) {
        showToast("error", "Lỗi", "Không thể tải danh sách hợp đồng!");
      }
    };

    const delay = setTimeout(handleSearch, 300);
    return () => clearTimeout(delay);
  }, [filters]);

  // ============================
  // CLEAR FILTERS
  // ============================
  const handleClear = async () => {
    setFilters({
      employee_id: "",
      dept_id: "",
      status: "",
      created_at: null,
      expiring: false,
    });

    try {
      const res = await contractsApi.list({});
      setContracts(res.data?.data || []);
    } catch (err) {
      console.error("Clear error:", err);
    }
  };

  // ============================
  // ⭐ MAP STATUS → NGÀY
  // ============================
  const getStatusTime = (c: any) => {
    switch (c.status) {
      case "draft":
        return c.created_at;

      case "sent_for_signing":
        return c.sent_for_signing_at;

      case "signed":
        return c.signed_at;

      case "active":
        return c.activated_at;

      case "terminated":
        return c.terminated_at;

      // ⭐ Bổ sung amended + others dùng chung status_at
      case "expired":
      case "cancel":
      case "amended":
      case "finalized":
        return c.status_at;

      default:
        return null;
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="overflow-auto" style={{ position: "relative" }}>
      <Toast ref={toast} />

      {/* ============================
          FILTER UI
      ============================ */}
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
  {(isRole1 || isHR || isDeptManager) && (  // Hiển thị ô mã nhân viên cho cả role_2 khác phòng ban 1
    <InputText
      placeholder="Mã nhân viên"
      value={filters.employee_id}
      onChange={(e) =>
        setFilters((prev) => ({ ...prev, employee_id: e.target.value }))
      }
    />
  )}

  {(isRole1 || isHR) && (
    <Dropdown
      value={filters.dept_id}
      options={departmentOptions}
      onChange={(e) => setFilters((prev) => ({ ...prev, dept_id: e.value }))}
      placeholder="Phòng ban"
    />
  )}

  <Dropdown
    value={filters.status}
    options={statusOptionsList}
    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.value }))}
    placeholder="Trạng thái"
  />

  <Calendar
    value={filters.created_at}
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        created_at: e.value ? (e.value as Date) : null,
      }))
    }
    placeholder="Ngày tạo"
    dateFormat="yy-mm-dd"
  />

  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <input
      type="checkbox"
      checked={filters.expiring}
      onChange={(e) =>
        setFilters((prev) => ({
          ...prev,
          expiring: e.target.checked,
        }))
      }
    />
    Sắp hết hạn (30 ngày)
  </label>

  <Button
    label="Clear"
    icon="pi pi-refresh"
    className="p-button-secondary"
    onClick={handleClear}
  />
</div>

      {/* ============================
          TABLE
      ============================ */}
      <table className="table" style={{ minWidth: 800 }}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th>Contract Code / Name</th>
            <th>Status</th>
            <th>Status Date At</th> {/* ⭐ NEW COLUMN */}
            <th style={{ width: 180 }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {contracts.length ? (
            contracts.map((c: any) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.contract_code || "-"}</td>

                <td>
                  <span
                    style={{
                      padding: "4px 10px",
                      background: "#e9ecef",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    {c.status}
                  </span>
                </td>

                {/* ⭐ SHOW STATUS DATE */}
                <td>
                  {getStatusTime(c)
                    ? moment(getStatusTime(c)).format("YYYY-MM-DD HH:mm")
                    : "-"}
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
              <td colSpan={5} style={{ textAlign: "center" }}>
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
