// client/src/api/contractsApi.ts
import axios from "../services/axios";
import apiUrl from "../constant/apiUrl";

// ==== Types (tuỳ nhu cầu có thể mở rộng thêm) ====
export type ContractStatus =
  | "draft" | "pending_approval" | "approved"
  | "sent_for_signing" | "signed" | "active"
  | "amended" | "terminated" | "expired";

export type ContractsListFilters = {
  status?: ContractStatus | string;
  employee_id?: string;
  department_id?: number;
};

export type SignerInput = {
  signer_employee_id?: string | null;
  signer_name?: string | null;
  signer_role: "employee" | "hr" | "legal" | "manager" | "representative";
  sign_order: number;
};

// ==== API object ====
const contractsApi = {
  // Danh sách hợp đồng
  list: (filters?: ContractsListFilters) =>
    axios.get(apiUrl.contracts.base, { params: filters }),

  // Chi tiết
  detail: (id: number) =>
    axios.get(apiUrl.contracts.detail(id)).then((res) => {
     console.log("API Response:", res.data);  // In dữ liệu trả về từ API  // Kiểm tra xem dữ liệu trả về có đủ thông tin không
    return res;
  }),
  

  // Tạo mới (Manager/Admin)
  create: (data: any) =>
    axios.post(apiUrl.contracts.base, data),

  // Cập nhật khi còn draft (Manager/Admin)
  updateDraft: (id: number, data: any) =>
    axios.put(apiUrl.contracts.updateDraft(id), data),

  // Quy trình duyệt
  submitApproval: (id: number) =>
    axios.post(apiUrl.contracts.submitApproval(id)),
  approve: (id: number) =>
    axios.post(apiUrl.contracts.approve(id)),

  // Chữ ký
  setSigners: (id: number, signers: SignerInput[]) =>
    axios.post(apiUrl.contracts.setSigners(id), { signers }),
  sendForSigning: (id: number) =>
    axios.post(apiUrl.contracts.sendForSigning(id)),
  sign: (id: number, order: number, evidence?: any) =>
    axios.post(apiUrl.contracts.sign(id, order), { evidence }),

  // Trạng thái hiệu lực / chấm dứt
  activate: (id: number) =>
    axios.post(apiUrl.contracts.activate(id)),
  terminate: (id: number, reason?: string) =>
    axios.post(apiUrl.contracts.terminate(id), { reason }),

  // Phụ lục
  addAmendment: (id: number, payload: any) =>
    axios.post(apiUrl.contracts.amendments(id), payload),

  // Đính kèm
  listAttachments: (id: number) =>
    axios.get(apiUrl.contracts.attachments(id)),
  addAttachment: (id: number, payload: any) =>
    axios.post(apiUrl.contracts.attachments(id), payload),

  // Audit
  listAudits: (id: number) =>
    axios.get(apiUrl.contracts.audits(id)),
};

export default contractsApi;
