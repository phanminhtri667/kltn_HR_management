import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import contractsApi from "../../api/contractsApi";

type ContractSignButtonProps = {
  contractId: number;
  order: number;
  label?: string;          // ✅ thêm label để phân biệt Ký / Duyệt
  disabled?: boolean;
  onSigned?: () => void;
};

const ContractSignButton: React.FC<ContractSignButtonProps> = ({
  contractId,
  order,
  label = "Ký hợp đồng",   // ✅ mặc định
  disabled = false,
  onSigned,
}) => {
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const toast = useRef<Toast>(null);

  const handleSign = async () => {
    setLoading(true);

    try {
      const evidence = { ip: "127.0.0.1", method: "digital" };
      const res = await contractsApi.sign(contractId, order, evidence);

      if (res?.data?.err === 0) {
        setSigned(true);
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail:
            label === "Duyệt"
              ? "Đã duyệt hợp đồng thành công 🎉"
              : "Đã ký hợp đồng thành công 🎉",
          life: 3000,
        });

        setTimeout(() => {
          onSigned?.();
        }, 1200);
      } else {
        toast.current?.show({
          severity: "warn",
          summary: "Thông báo",
          detail: res?.data?.mes || "Thao tác thất bại!",
          life: 4000,
        });
      }
    } catch (error) {
      console.error("Sign error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể thực hiện thao tác!",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Toast ref={toast} position="top-center" />

      {signed ? (
        <span className="text-green-600 text-sm">
          ✅ {label === "Duyệt" ? "Đã duyệt" : "Đã ký"} thành công
        </span>
      ) : (
        <Button
          label={loading ? "Đang xử lý..." : label}
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
          className={`p-button-sm ${
            label === "Duyệt" ? "p-button-success" : "p-button-primary"
          }`}
          disabled={disabled || loading}
          onClick={handleSign}
        />
      )}
    </div>
  );
};

export default ContractSignButton;
