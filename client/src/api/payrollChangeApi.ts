import AxiosInstance from "../services/axios";

export type PayrollChangeItem = {
  id: number;
  payroll_id: number;
  change_type: "status" | "data";
  old_data: Record<string, any>;
  new_data: Record<string, any>;
  description: string;
  changed_at: string;
  // enrich từ join
  employee_id?: string | null;
  employee_name?: string | null;
  department_id?: number | null;
  month?: string | null;
};

export const fetchPayrollChanges = (params?: {
  month?: string;          // "YYYY-MM"
  employee_id?: string;    // "AD0001"
  department_id?: number;  // 1,2,3...
  limit?: number;
}) =>
  AxiosInstance.get("/api/payroll-changes", { params });

export const fetchPayrollChangesByPayroll = (payroll_id: number) =>
  AxiosInstance.get("/api/payroll-changes/by-payroll", { params: { payroll_id } });
