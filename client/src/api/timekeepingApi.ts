<<<<<<< HEAD
import axios from "../services/axios";
import apiUrl from "../constant/apiUrl";

// Định nghĩa các tham số lọc cho timekeeping
export type TimekeepingFilters = {
  employee_id?: string;
  department_id?: number | string;
  date_from?: string; // "YYYY-MM-DD"
  date_to?: string;   // "YYYY-MM-DD"
};

const timekeepingApi = {
  // Lấy danh sách chấm công với bộ lọc
  list: (filters: TimekeepingFilters) => axios.get(apiUrl.timekeeping.index, { params: filters }),

  // Lấy tất cả chấm công (Admin)
  getAll: () => axios.get(apiUrl.timekeeping.index),  // Không cần `/all` nữa vì đã có route `/` cho admin

  // Lấy chấm công theo phòng ban (Quản lý, Admin)
  getByDepartment: (departmentId: string) => axios.get(`${apiUrl.timekeeping.department}/${departmentId}`),

  // ⏱️ Nhân viên check-in (tạo bản ghi mới)
  create: (data: any) => axios.post(apiUrl.timekeeping.checkIn, data),  // Đảm bảo đúng URL và phương thức POST

  // 🔚 Nhân viên check-out (cập nhật giờ check-out + tính tổng giờ làm)
  checkout: (data: any) => axios.patch(`${apiUrl.timekeeping.checkOut}`, data),

  getSummary: (month?: string) => axios.get(apiUrl.timekeeping.summary, { params: { month } }),
};

export default timekeepingApi;
=======
import axios from "../services/axios";
import apiUrl from "../constant/apiUrl";

// Định nghĩa các tham số lọc cho timekeeping
export type TimekeepingFilters = {
  employee_id?: string;
  department_id?: number | string;
  date_from?: string; // "YYYY-MM-DD"
  date_to?: string;   // "YYYY-MM-DD"
};

const timekeepingApi = {
  // Lấy danh sách chấm công với bộ lọc
  list: (filters: TimekeepingFilters) => axios.get(apiUrl.timekeeping.index, { params: filters }),

  // Lấy tất cả chấm công (Admin)
  getAll: () => axios.get(apiUrl.timekeeping.index),  // Không cần `/all` nữa vì đã có route `/` cho admin

  // Lấy chấm công theo phòng ban (Quản lý, Admin)
  getByDepartment: (departmentId: string) => axios.get(`${apiUrl.timekeeping.department}/${departmentId}`),

  // ⏱️ Nhân viên check-in (tạo bản ghi mới)
  create: (data: any) => axios.post(apiUrl.timekeeping.checkIn, data),  // Đảm bảo đúng URL và phương thức POST

  // 🔚 Nhân viên check-out (cập nhật giờ check-out + tính tổng giờ làm)
  checkout: (data: any) => axios.patch(`${apiUrl.timekeeping.checkOut}`, data),
};

export default timekeepingApi;
>>>>>>> thongbilag
  