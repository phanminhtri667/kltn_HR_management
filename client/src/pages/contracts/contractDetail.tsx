import React, { useMemo, useState, useRef } from "react";
import contractsApi from "../../api/contractsApi";
import { Toast } from "primereact/toast";
import ContractSignButton from "./ContractSignButton";
import CancelReasonModal from "./CancelReasonModal";
import "./contracts.scss";

type Props = {
  detail?: any;
  contract?: any;
  view?: any;
};

const fmt = (v: any) => (v == null || v === "" ? "-" : String(v));

/* =====================================================
   LẤY SIGNERS NHƯ CODE CŨ
===================================================== */
const getSigners = (d: any, v?: any) => {
  const arr = v?.signers ?? d?.signatures ?? d?.signers ?? [];
  return (arr as any[]).map((s: any, idx: number) => ({
    name:
      s?.name ??
      s?.signer_name ??
      s?.signerEmployee?.full_name ??
      s?.signer_employee_id ??
      "-",
    role: s?.role ?? s?.signer_role ?? "-",
    order: s?.order ?? s?.sign_order ?? idx + 1,
    signedAt: s?.signedAt ?? s?.signed_at ?? null,
    signer_employee_id: s?.signer_employee_id ?? null,
    signer_user_id: s?.signer_user_id ?? null,
    sign_status: s?.sign_status ?? null,
  }));
};

const ContractDetail: React.FC<Props> = (props) => {
  const toast = useRef<Toast>(null);

  const detail = useMemo(() => {
    if (props.detail) return props.detail;
    if (props.contract) {
      return {
        err: 0,
        data: props.contract,
        rendered_html: props.contract.rendered_html,
        view: props.view,
      };
    }
    return null;
  }, [props.detail, props.contract, props.view]);

  const c = detail?.data;
  const v = detail?.view;
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  const signers = c ? getSigners(c, v) : [];

  const [loading, setLoading] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  const isAdmin = loggedInUser?.role_code === "role_1";
  const isManagerDept1 =
    loggedInUser?.role_code === "role_2" &&
    Number(loggedInUser.department_id) === 1;

  if (!detail || !c) return <div>Không có dữ liệu hợp đồng.</div>;

  /* =====================================================
     ACTION HANDLER + TOAST
  ===================================================== */
  const doAction = async (apiCall: any, successMessage: string) => {
    setLoading(true);
    try {
      const res = await apiCall();

      if (res?.data?.err === 0) {
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: successMessage,
          life: 1800,
        });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: res?.data?.mes || "Thao tác thất bại.",
          life: 3000,
        });
      }
    } catch (e: any) {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi hệ thống",
        detail: e?.response?.data?.mes || "Không thể kết nối server.",
        life: 3000,
      });
    }
    setLoading(false);
  };

  const actionSendForSigning = () =>
    doAction(() => contractsApi.sendForSigning(c.id), "Gửi ký thành công.");

  const actionCancel = () => setShowCancelModal(true);

  const actionTerminate = () => setShowTerminateModal(true);

  const actionFinalize = () =>
    doAction(() => contractsApi.finalize(c.id), "Finalize thành công.");

  /* =====================================================
      RENDER BUTTON
  ===================================================== */
  const renderBtn = (label: string, color: "blue" | "red" | "green", enabled: boolean, onClick?: any) => (
    <button
      key={label}
      disabled={!enabled || loading}
      onClick={enabled ? onClick : undefined}
      className={`contract-btn ${color} ${enabled ? "" : "disabled"}`}
    >
      {label}
    </button>
  );

  /* =====================================================
     ACTION RULES
  ===================================================== */
  const renderActions = () => {
    const s = c.status;

    return (
      <div className="contract-actions-row">
        {renderBtn(`STATUS: ${s.toUpperCase()}`, "green", false)}

        {s === "draft" && (
          <>
            {renderBtn("Send for signing", "blue", isManagerDept1, actionSendForSigning)}
            {renderBtn("Cancel", "red", isAdmin || isManagerDept1, actionCancel)}
          </>
        )}

        {s === "sent_for_signing" &&
          renderBtn(
            "Cancel",
            "red",
            isAdmin || isManagerDept1 || loggedInUser?.role_code === "role_3",
            actionCancel
          )}
        {s === "signed" &&
          renderBtn("Cancel", "red", isAdmin, actionCancel)}

        {s === "active" &&
          renderBtn("Terminate", "red", isAdmin, actionTerminate)}

        {(s === "terminated" || s === "expired") &&
          renderBtn("Finalize", "blue", isManagerDept1, actionFinalize)}
      </div>
    );
  };

  /* =====================================================
      RENDER
  ===================================================== */
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-lg p-6">
      <Toast ref={toast} />

      <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: detail.rendered_html }} />

      {/* =================== KÝ HỢP ĐỒNG =================== */}
      <div className="mt-10 border-t pt-4">
        <h3 className="font-bold text-lg mb-3">Ký hợp đồng</h3>

        {signers.length ? (
          <ul style={{ paddingLeft: 18 }}>
            {signers.map((s, idx) => {
              const isSigned = !!s.signedAt;

              const canSign =
                c.status === "sent_for_signing" &&
                s.sign_status === "pending" &&
                !s.signedAt &&
                (
                  String(s.signer_employee_id || "") === String(loggedInUser.employee_id || "") ||
                  String(s.signer_user_id || "") === String(loggedInUser.id || "")
                );

              return (
                <li key={idx} className="flex items-center gap-3 mb-2">
                  #{s.order} — {fmt(s.name)} ({fmt(s.role)})

                  {isSigned ? (
                    <span className="text-green-600 text-sm">• Đã ký lúc {s.signedAt}</span>
                  ) : canSign ? (
                    <ContractSignButton
                      contractId={c.id}
                      order={s.order}
                      onSigned={() => window.location.reload()}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">• Chờ ký</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div>-</div>
        )}
      </div>

      <div className="contract-actions-container-bottom">{renderActions()}</div>

      {/* ------------ MODAL HỦY HỢP ĐỒNG ------------ */}
      <CancelReasonModal
        visible={showCancelModal}
        title="Lý do hủy hợp đồng"
        onHide={() => setShowCancelModal(false)}
        onSubmit={(reason) => {
          setShowCancelModal(false);
          doAction(() => contractsApi.cancel(c.id, reason), "Hủy hợp đồng thành công.");
        }}
      />

      {/* ------------ MODAL CHẤM DỨT HỢP ĐỒNG ------------ */}
      <CancelReasonModal
        visible={showTerminateModal}
        title="Lý do chấm dứt hợp đồng"
        onHide={() => setShowTerminateModal(false)}
        onSubmit={(reason) => {
          setShowTerminateModal(false);
          doAction(() => contractsApi.terminate(c.id, reason), "Chấm dứt hợp đồng thành công.");
        }}
      />
    </div>
  );
};

export default ContractDetail;
