import AxiosInstance from "../services/axios";
import apiUrl from "../constant/apiUrl";

const leaveApi = {
  create: (payload: any) => AxiosInstance.post(apiUrl.leave.create, payload),
  getMyLeaves: (employee_id: string) =>
    AxiosInstance.get(`${apiUrl.leave.my}?employee_id=${employee_id}`),
  getAll: () => AxiosInstance.get(apiUrl.leave.getAll),
  approve: (id: number, approver_id: string) =>
    AxiosInstance.patch(`${apiUrl.leave.approve}/${id}/approve`, { approver_id }),
  reject: (id: number, approver_id: string, reject_reason: string) =>
    AxiosInstance.patch(`${apiUrl.leave.reject}/${id}/reject`, { approver_id, reject_reason }),
};

export default leaveApi;
