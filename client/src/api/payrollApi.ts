import AxiosInstance from "../services/axios";
import apiUrl from "../constant/apiUrl";

export const fetchAllPayrolls = (params?: any) =>
  AxiosInstance.get(apiUrl.payroll.index, { params });   // /api/payroll

export const fetchMyPayrolls = (params?: any) =>
  AxiosInstance.get(apiUrl.payroll.mine, { params });    // /api/payroll/me
