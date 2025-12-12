import AxiosInstance from "../services/axios";
import apiUrl from "../constant/apiUrl";

// =========================
// PAYROLL LIST APIs
// =========================

export const fetchAllPayrolls = (params?: any) =>
  AxiosInstance.get(apiUrl.payroll.index, { params });

export const fetchMyPayrolls = (params?: any) =>
  AxiosInstance.get(apiUrl.payroll.mine, { params });


// =========================
// PAYROLL SETTINGS APIs
// =========================

export const getPayrollSettings = () =>
  AxiosInstance.get(apiUrl.payroll.settings.list);  
// GET /api/payroll/settings


export const getPayrollSettingByKey = (key: string) =>
  AxiosInstance.get(apiUrl.payroll.settings.get(key));
// GET /api/payroll/settings/:key


export const updatePayrollSetting = (key: string, value: string | number) =>
  AxiosInstance.put(apiUrl.payroll.settings.update(key), { value });
// PUT /api/payroll/settings/:key
