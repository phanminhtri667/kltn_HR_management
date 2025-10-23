import "primeicons/primeicons.css";
import { Link } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import React, { useRef } from "react";
import contractsApi from "../../api/contractsApi";

type Props = {
  data: any[];
  onReload: () => void;
  onOpenDetail: (row: any) => void;
  onEditDraft: (row: any) => void;
};

const statusText: Record<string, string> = {
  draft: "Nháp",
  pending_approval: "Chờ duyệt",
  approved: "Đã duyệt",
  sent_for_signing: "Đang ký",
  signed: "Đã ký",
  active: "Hiệu lực",
  amended: "Có phụ lục",
  terminated: "Chấm dứt",
  expired: "Hết hạn",
};

export default function ContractsTable({
  data,
  onReload,
  onOpenDetail,
  onEditDraft,
}: Props) {
  const toast = useRef<Toast | null>(null);

  const confirmTerminate = (row: any) => {
    confirmDialog({
      message: `Chấm dứt hợp đồng ${row.contract_code}?`,
      header: "Confirm",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await contractsApi.terminate(row.id, "manual");
        toast.current?.show({ severity: "success", summary: "OK", detail: "Terminated", life: 1200 });
        onReload?.();
      },
    });
  };

  const rows = Array.isArray(data) ? data : [];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Mã HĐ</th>
            <th>Nhân viên</th>
            <th>Chức danh</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Trạng thái</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((r: any, idx: number) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  {r.contract_code}
                </td>
                <td>{r.employee?.full_name || r.employee_id}</td>
                <td>{r.job_title || "-"}</td>
                <td>{r.start_date}</td>
                <td>{r.end_date || "-"}</td>
                <td>{statusText[r.status] || r.status}</td>
                <td>
                  <div className="table-acction">
                    {/* Route riêng chi tiết nếu bạn có /contracts/:id */}
                    <Link to={`/contracts/${r.id}`}>
                      <i className="pi pi-eye pointer icon-hover" />
                    </Link>

                    {r.status === "draft" && (
                      <i className="pi pi-pencil pointer icon-hover ml-3"
                         onClick={() => onEditDraft?.(r)} />
                    )}

                    {r.status === "active" && (
                      <i className="pi pi-ban pointer icon-hover ml-3"
                         onClick={() => confirmTerminate(r)} />
                    )}

                    <i className="pi pi-search pointer icon-hover ml-3"
                       onClick={() => onOpenDetail?.(r)} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={8}><p style={{ textAlign: "center" }}>No data</p></td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
