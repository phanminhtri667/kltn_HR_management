import React from "react";

type Props = { contract: any | null };

const fmt = (v: any) => (v == null || v === "" ? "-" : String(v));

// Lấy tên nhân viên từ nhiều nguồn (include, view, flatten)
const getEmployeeName = (c: any): string =>
  c?.employee?.full_name ??
  c?.view?.employeeName ??
  c?.employee_name ??
  "";

// Lấy tên phòng ban (ưu tiên: dept trên HĐ -> dept của employee -> view -> flatten)
const getDepartmentName = (c: any): string =>
  c?.department?.value ??
  c?.employee?.department?.value ??
  c?.view?.departmentName ??
  c?.department_name ??
  "";

// Tính Effective Date (ưu tiên: view.effectiveDate -> activated -> signed -> amendment mới nhất -> start)
const getEffectiveDate = (c: any): string | null => {
  const ed =
    c?.view?.effectiveDate ??
    c?.activated_at ??
    c?.signed_at ??
    c?.amendments?.[0]?.effective_date ??
    c?.start_date ??
    null;
  return ed ? String(ed) : null;
};

// Gom mảng chữ ký từ nhiều nguồn và chuẩn hoá field hiển thị
const getSigners = (c: any): Array<{
  name: string;
  role: string;
  order: number;
  signedAt?: string | null;
}> => {
  const arr =
    c?.view?.signers /* [{name,role,status,signedAt,order}] */ ??
    c?.signatures /* raw include từ Sequelize */ ??
    c?.signers /* nếu BE từng flatten */ ??
    [];

  return (arr as any[]).map((s: any, idx: number) => {
    const name =
      s?.name /* view */ ??
      s?.signer_name /* raw */ ??
      s?.signerEmployee?.full_name /* include signerEmployee nếu có */ ??
      s?.signer_employee_id ??
      "-";
    const role = s?.role ?? s?.signer_role ?? "-";
    const order = s?.order ?? s?.sign_order ?? idx + 1;
    const signedAt = s?.signedAt ?? s?.signed_at ?? null;

    return { name, role, order, signedAt: signedAt ? String(signedAt) : null };
  });
};

const ContractDetail: React.FC<Props> = ({ contract }) => {
  if (!contract) return <div>Không có dữ liệu hợp đồng.</div>;

  const employeeName = getEmployeeName(contract);
  const departmentName = getDepartmentName(contract);
  const effectiveDate = getEffectiveDate(contract);
  const signers = getSigners(contract);

  return (
    <div className="space-y-2">
      <div><b>ID:</b> {fmt(contract.id)}</div>
      <div><b>Contract Code:</b> {fmt(contract.contract_code)}</div>
      <div><b>Name / Title:</b> {fmt(contract.name || contract.job_title)}</div>
      <div><b>Status:</b> {fmt(contract.status)}</div>

      <div className="mt-3"><b>Employee</b></div>
      <div><b>Employee ID:</b> {fmt(contract.employee_id)}</div>
      <div><b>Employee Name:</b> {fmt(employeeName)}</div>
      <div><b>Department:</b> {fmt(departmentName)}</div>

      <div className="mt-3"><b>Dates</b></div>
      <div><b>Start Date:</b> {fmt(contract.start_date)}</div>
      <div><b>End Date:</b> {fmt(contract.end_date)}</div>
      <div><b>Effective Date:</b> {fmt(effectiveDate)}</div>

      <div className="mt-3"><b>Compensation</b></div>
      <div><b>Base Salary:</b> {fmt(contract.base_salary)}</div>
      <div><b>Currency:</b> {fmt(contract.currency || "VND")}</div>
      <div><b>Pay Frequency:</b> {fmt(contract.pay_frequency)}</div>

      <div className="mt-3"><b>Signers</b></div>
      {signers.length ? (
        <ul style={{ paddingLeft: 18 }}>
          {signers.map((s, idx) => (
            <li key={idx}>
              #{s.order} — {fmt(s.name)} ({fmt(s.role)})
              {s.signedAt ? ` • signed at ${s.signedAt}` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <div>-</div>
      )}

      {contract.notes && (
        <>
          <div className="mt-3"><b>Notes</b></div>
          <div>{contract.notes}</div>
        </>
      )}
    </div>
  );
};

export default ContractDetail;
