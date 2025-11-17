import React, { useRef, useState, useEffect } from "react";
import contractsApi from "../../api/contractsApi";
import { Toast } from "primereact/toast";

interface ContractsListProps {
  data: any[];
  onView: (id: number) => void;
  reload?: () => void;
}

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Approved", value: "approved" },
  { label: "Sent for Signing", value: "sent_for_signing" },
  { label: "Signed", value: "signed" },
  { label: "Active", value: "active" },
  { label: "Terminated", value: "terminated" },
];

const ContractsList: React.FC<ContractsListProps> = ({ data, onView, reload }) => {
  const [contracts, setContracts] = useState(data);
  const toast = useRef<Toast>(null);

  // Cập nhật lại danh sách khi prop data thay đổi
  useEffect(() => {
    setContracts(data);
  }, [data]);

  const showToast = (
    severity: "success" | "error" | "warn" | "info",
    summary: string,
    detail: string
  ) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  const handleStatusChange = async (contractId: number, newStatus: string) => {
    if (!contractId) {
      showToast("error", "Lỗi", "Contract ID không hợp lệ!");
      return;
    }

    try {
      let message = "";

      if (newStatus === "approved") {
        await contractsApi.approve(contractId);
        message = "✅ Hợp đồng đã được phê duyệt thành công.";
      } else if (newStatus === "sent_for_signing") {
        await contractsApi.sendForSigning(contractId);
        message = "📩 Hợp đồng đã được gửi để ký.";
      } else if (newStatus === "terminated") {
        const reason = prompt("Nhập lý do chấm dứt hợp đồng:");
        await contractsApi.terminate(contractId, reason || "Terminated manually");
        message = "⛔ Hợp đồng đã bị chấm dứt.";
      } else {
        showToast("info", "Thông báo", "Trạng thái này không thể đổi thủ công!");
        return;
      }

      // ✅ Cập nhật UI ngay lập tức
      setContracts((prev) =>
        prev.map((item) =>
          item.id === contractId ? { ...item, status: newStatus } : item
        )
      );

      showToast("success", "Thành công", message);
      reload?.();
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);

      // 🔹 Ưu tiên hiển thị message trả về từ backend
      const backendMsg = err?.response?.data?.mes;
      const axiosMsg = err?.response?.statusText;
      const defaultMsg = err?.message || "Lỗi không xác định khi cập nhật trạng thái!";

      let messageToShow = backendMsg || axiosMsg || defaultMsg;

      // 🔸 Chuẩn hóa thông báo tiếng Việt dễ hiểu
      if (messageToShow.includes("No signers configured"))
        messageToShow = "❗ Không thể gửi ký vì chưa cấu hình người ký trong hợp đồng.";
      else if (messageToShow.includes("Forbidden"))
        messageToShow = "🚫 Bạn không có quyền thực hiện hành động này.";
      else if (messageToShow.includes("Invalid current status"))
        messageToShow = "⚠️ Trạng thái hiện tại của hợp đồng không hợp lệ để chuyển đổi.";

      showToast("error", "Lỗi khi cập nhật", messageToShow);
    }
  };

  return (
    <div className="overflow-auto" style={{ position: "relative" }}>
      <Toast ref={toast} />

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
                    {statusOptions.map((opt) => (
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
