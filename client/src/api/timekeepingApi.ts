import axios from "../services/axios";
import apiUrl from "../constant/apiUrl";

export type TimekeepingFilters = {
  employee_id?: string;
  department_id?: number | string;
  date_from?: string; // "YYYY-MM-DD"
  date_to?: string;   // "YYYY-MM-DD"
};

const timekeepingApi = {
  // 🔎 Lấy danh sách có filter qua query:
  // GET /api/timekeeping?employee_id=AD0001&department_id=1&date_from=2025-09-01&date_to=2025-09-13
  list: (filters: TimekeepingFilters = {}) =>
    axios.get(apiUrl.timekeeping.index, { params: filters }),

  // 👀 Xem toàn bộ (không filter) — khớp router GET "/all"
  getAll: () => axios.get(`${apiUrl.timekeeping.index}/all`),

  // 🏢 Lấy theo phòng ban (route cũ vẫn dùng được)
  getByDepartment: (id: string | number) =>
    axios.get(`${apiUrl.timekeeping.index}/department/${id}`),

  // ⏱️ Check-in (tạo bản ghi mới)
  create: (data: any) => axios.post(apiUrl.timekeeping.index, data),

  // 🔚 Checkout (cập nhật giờ ra + tính giờ) — dùng PATCH cho khớp router
  checkout: (data: any) =>
    axios.patch(`${apiUrl.timekeeping.index}/checkout`, data),
};

export default timekeepingApi;
