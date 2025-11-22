import React, { useState, useRef } from "react";  // Import useRef từ react
import { Button } from "primereact/button"; 
import { Toast } from "primereact/toast";
import contractsApi from "../../api/contractsApi";  // Import API

interface ContractSignProps {
  contract: any | null;  // Nhận prop contract từ cha
  refreshContracts: () => void; // Hàm refresh danh sách hợp đồng
}

const ContractSign: React.FC<ContractSignProps> = ({ contract, refreshContracts }) => {
  const [signing, setSigning] = useState(false);  // Trạng thái đang ký hợp đồng
  const toast = useRef<Toast | null>(null);  // Khai báo toast với useRef

  // Hàm gửi hợp đồng đi ký
  const handleSendForSigning = async () => {
    if (contract) {
      try {
        setSigning(true);
        await contractsApi.sendForSigning(contract.id);  // Gọi API gửi hợp đồng đi ký
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Contract sent for signing",
          life: 3000,
        });
        refreshContracts();  // Refresh danh sách hợp đồng sau khi gửi đi ký
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to send contract for signing",
          life: 3000,
        });
      } finally {
        setSigning(false);
      }
    }
  };

  // Hàm ký hợp đồng (nếu đã được gửi đi ký)
  const handleSignContract = async () => {
    if (contract) {
      try {
        setSigning(true);
        await contractsApi.sign(contract.id, 1);  // Gọi API ký hợp đồng (signer 1 là ví dụ)
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Contract signed",
          life: 3000,
        });
        refreshContracts();  // Refresh danh sách hợp đồng sau khi ký
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to sign contract",
          life: 3000,
        });
      } finally {
        setSigning(false);
      }
    }
  };

  return (
    <div>
      <h3>Sign Contract</h3>

      {/* Nếu hợp đồng chưa được gửi đi ký */}
      {contract?.status !== "sent_for_signing" ? (
        <Button 
          label="Send for Signing" 
          onClick={handleSendForSigning} 
          loading={signing}
          disabled={signing}
        />
      ) : (
        <Button 
          label="Sign Contract" 
          onClick={handleSignContract} 
          loading={signing}
          disabled={signing}
        />
      )}

      <Toast ref={toast} />
    </div>
  );
};

export default ContractSign;
