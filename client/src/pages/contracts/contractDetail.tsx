import React, { useMemo } from "react";
import ContractSignButton from "./ContractSignButton";

type ContractDetailResponse = {
  err?: number;
  data: any;
  view?: {
    employeeName?: string;
    departmentName?: string;
    effectiveDate?: string | null;
    signers?: Array<{
      name: string;
      role: string;
      status?: string;
      order: number;
      signedAt?: string | null;
      signer_employee_id?: string | null;
      signer_user_id?: number | null;
      sign_status?: string | null;
    }>;
  };
  rendered_html?: string;
};

type Props = {
  detail?: ContractDetailResponse | null;
  contract?: any | null;
  view?: ContractDetailResponse["view"];
};

const fmt = (v: any) => (v == null || v === "" ? "-" : String(v));

const getSigners = (d: any, v?: ContractDetailResponse["view"]) => {
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
  const detail: ContractDetailResponse | null = useMemo(() => {
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

  const html = useMemo(() => detail?.rendered_html ?? "", [detail?.rendered_html]);

  if (!detail || !c) return <div>Không có dữ liệu hợp đồng.</div>;
  if (detail.err) return <div>Không tải được hợp đồng: {detail.err}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-lg p-6">
      {/* 🧾 Hiển thị luôn nội dung văn bản hợp đồng */}
      <div className="prose max-w-none mb-6">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div>Chưa có nội dung template cho hợp đồng này.</div>
        )}
      </div>

      {/* ✍️ Phần ký hợp đồng */}
      <div className="mt-6 border-t pt-4">
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
                  String(s.signer_employee_id || "") ===
                    String(loggedInUser.employee_id || "") ||
                  String(s.signer_user_id || "") ===
                    String(loggedInUser.id || "")
                );

              return (
                <li key={idx} className="flex items-center gap-2 mb-2">
                  #{s.order} — {fmt(s.name)} ({fmt(s.role)})
                  {isSigned ? (
                    <span className="text-green-600 text-sm">
                      • Đã ký lúc {s.signedAt}
                    </span>
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
    </div>
  );
};

export default ContractDetail;
