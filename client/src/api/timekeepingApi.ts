import axios from "../services/axios";
import apiUrl from "../constant/apiUrl";

const timekeepingApi = {
  // Lấy tất cả chấm công
  getAll: () => axios.get(apiUrl.timekeeping.index),

  // Lấy theo phòng ban
  getByDepartment: (id: string | number) =>
    axios.get(`${apiUrl.timekeeping.index}/department/${id}`),

  // Check-in (tạo mới bản ghi chấm công)
  create: (data: any) => axios.post(apiUrl.timekeeping.index, data),

  // Checkout (cập nhật giờ ra + tính giờ làm)
  checkout: (data: any) =>
    axios.put(`${apiUrl.timekeeping.index}/checkout`, data),
};

export default timekeepingApi;
