// client/src/pages/contracts/contracts.tsx
import React, { useEffect, useRef, useState } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import { TabView, TabPanel } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";

import contractsApi from "../../api/contractsApi";
import ContractsList from "./contractsList";
import ContractDetail from "./contractDetail";
import ContractCreate from "./contractCreate";
import ContractSign from "./contractSign";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";


type Contract = any; // TODO: thay bằng interface của bạn nếu có

export default function Contracts() {
  const [rows, setRows] = useState<Contract[]>([]);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const toast = useRef<Toast | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  // Load danh sách
  const load = async () => {
    try {
      const res = await contractsApi.list();
      setRows(res?.data?.data ?? []);
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Không tải được danh sách hợp đồng",
        life: 1500,
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

const handleView = async (id: number) => {
  try {
    const res = await contractsApi.detail(id);
    const payload = res?.data || {};
    const contract = payload.data
      ? { ...payload.data, rendered_html: payload.rendered_html }
      : null;

    setSelected(contract);
  } catch {
    const fallback = rows.find((r: any) => Number(r.id) === Number(id)) || null;
    setSelected(fallback);
  } finally {
    setDetailOpen(true);
  }
};


  // Cho Editor/Sign gọi refresh
  const refreshContracts = () => load();

  return (
    <DefaultLayout>
      <TabView>
        <TabPanel header="Contracts List">
          <ContractsList data={rows} onView={handleView} />
        </TabPanel>
        {user &&
        (
          (user.role_code !== "role_3" && user.role_code !== "role_2"&& user.role_code !== "role_1") ||
          (user.role_code === "role_2" && user.department_id === 1)
        ) && (
          <TabPanel header="Add Contract">
            <ContractCreate
              onCreated={() =>
                toast.current?.show({
                  severity: "success",
                  summary: "Thành công",
                  detail: "Tạo hợp đồng thành công",
                  life: 2000,
                })
              }
            />
          </TabPanel>
        )}
        <TabPanel header="Sign Contract">
          <ContractSign contract={selected} refreshContracts={refreshContracts} />
        </TabPanel>
      </TabView>

      {/* Modal xem chi tiết (thay cho tab Contract Detail) */}
      <Dialog
        header="Contract Detail"
        visible={detailOpen}
        style={{ width: "60vw", maxWidth: 960 }}
        onHide={() => setDetailOpen(false)}
      >
        <ContractDetail contract={selected} />
      </Dialog>

      <Toast ref={toast} />
    </DefaultLayout>
  );
}
