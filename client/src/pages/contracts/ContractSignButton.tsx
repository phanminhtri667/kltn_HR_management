import React, { useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import contractsApi from "../../api/contractsApi";

type ContractSignButtonProps = {
  contractId: number;
  order: number;
  disabled?: boolean;
  onSigned?: () => void;
};

const ContractSignButton: React.FC<ContractSignButtonProps> = ({
  contractId,
  order,
  disabled = false,
  onSigned,
}) => {
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const toast = React.useRef<Toast>(null);

  const handleSign = async () => {
    setLoading(true);

    try {
      const evidence = { ip: "127.0.0.1", method: "digital" };
      const res = await contractsApi.sign(contractId, order, evidence);

      if (res.data.err === 0) {
        setSigned(true);
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Đã ký hợp đồng thành công 🎉",
          life: 3000,
        });

        // Reload lại danh sách chữ ký nhẹ nhàng
        setTimeout(() => {
          if (onSigned) onSigned();
        }, 1200);
      } else {
        toast.current?.show({
          severity: "warn",
          summary: "Thông báo",
          detail: res.data.mes || "Ký thất bại!",
          life: 4000,
        });
      }
    } catch (error) {
      console.error("Sign error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể ký hợp đồng!",
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
        <span className="text-green-600 text-sm">✅ Đã ký thành công</span>
      ) : (
        <Button
          label={loading ? "Đang ký..." : "Ký hợp đồng"}
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-pen"}
          className="p-button-sm p-button-success"
          disabled={disabled || loading}
          onClick={handleSign}
        />
      )}
    </div>
  );
};

export default ContractSignButton;
