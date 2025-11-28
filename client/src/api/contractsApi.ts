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

const contractsApi = {
  // ===== Templates & Create-form =====
  // GET /api/contracts/templates
  listTemplates: () => axios.get(apiUrl.contracts.templates),

  // GET /api/contracts/create-form?template_id=&employee_id=
  // (employee_id optional để BE gợi ý dept/position)
  createForm: (template_id?: number, employee_id?: string) =>
    axios.get(apiUrl.contracts.createForm, {
      params: { template_id, employee_id },
    }),

  // (tuỳ chọn) GET /api/legal-entities để đổ dropdown công ty
  listLegalEntities: () => axios.get(apiUrl.contracts.legalEntity.index),

  // ===== Contracts CRUD & workflow =====
  getStatusOptions: () => axios.get(apiUrl.contracts.statuses),
  getDepartments: () => axios.get(apiUrl.department.index),
  list: (filters?: ContractsListFilters) =>
    axios.get(apiUrl.contracts.base, { params: filters }),

  detail: (id: number) =>
    axios.get(apiUrl.contracts.detail(id)),

  create: (data: any) =>
    axios.post(apiUrl.contracts.base, data),

  updateDraft: (id: number, data: any) =>
    axios.put(apiUrl.contracts.updateDraft(id), data),

  cancel: (id: number, reason: string) =>
    axios.post(apiUrl.contracts.cancel(id), { reason }),

  finalize: (id: number) =>
    axios.post(apiUrl.contracts.finalize(id)),

  setSigners: (id: number, signers: SignerInput[]) =>
    axios.post(apiUrl.contracts.setSigners(id), { signers }),

  sendForSigning: (id: number) =>
    axios.post(apiUrl.contracts.sendForSigning(id)),

  sign: (id: number, order: number, evidence?: any) =>
    axios.post(apiUrl.contracts.sign(id, order), { evidence }),

  //activate: (id: number) =>axios.post(apiUrl.contracts.activate(id)),

  terminate: (id: number, reason?: string) =>
    axios.post(apiUrl.contracts.terminate(id), { reason }),

  addAmendment: (id: number, payload: any) =>
    axios.post(apiUrl.contracts.amendments(id), payload),

  listAttachments: (id: number) =>
    axios.get(apiUrl.contracts.attachments(id)),

  addAttachment: (id: number, payload: any) =>
    axios.post(apiUrl.contracts.attachments(id), payload),

  listAudits: (id: number) =>
    axios.get(apiUrl.contracts.audits(id)),
};

export default contractsApi;
