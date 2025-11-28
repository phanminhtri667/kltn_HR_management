import AxiosInstance from "../services/axios";
import apiUrl from "../constant/apiUrl";

export type PayrollChangeItem = {
  id: number;
  payroll_id: number;
  change_type: "status" | "data";
  old_data: Record<string, any>;
  new_data: Record<string, any>;
  description: string;
  changed_at: string;
  employee_id?: string | null;
  employee_name?: string | null;
  department_id?: number | null;
  month?: string | null;
};

export const fetchPayrollChanges = (params?: {
  month?: string;
  employee_id?: string;
  department_id?: number;
  limit?: number;
}) =>
  AxiosInstance.get(apiUrl.payroll_changes.index, { params });

export const fetchPayrollChangesByPayroll = (payroll_id: number) =>
  AxiosInstance.get(`${apiUrl.payroll_changes.index}/by-payroll`, {
    params: { payroll_id },
  });
