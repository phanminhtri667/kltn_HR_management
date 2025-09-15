// client/src/api/employeeApi.ts
import AxiosInstance from '../services/axios';
import apiUrl from '../constant/apiUrl';

// (tuỳ chọn) định nghĩa kiểu trả về cho gợi ý và danh sách
type SuggestRes = { err: number; data: string[] };
type ListRes<T = any> = { err: number; mes?: string; data: T[] };

const employeeApi = {
  // Lấy nhân viên theo phòng ban
  getEmployeesByDepartment: async (departmentId: number) => {
    const { data } = await AxiosInstance.get<ListRes>(
      `${apiUrl.employee.index}/department/${departmentId}`
    );
    return data; // { err, data }
  },

  // Tìm theo employee_id (chứa chuỗi q)
  searchById: async (q: string) => {
    const { data } = await AxiosInstance.get<ListRes>(apiUrl.employee.index, {
      params: q ? { employee_id: q } : {},
    });
    return data; // { err, data }
  },

  // Gợi ý employee_id khi gõ
  suggestIds: async (q: string) => {
    if (!q) return { err: 0, data: [] } as SuggestRes; // tránh request rỗng
    const { data } = await AxiosInstance.get<SuggestRes>(
      `${apiUrl.employee.index}/suggest`,
      { params: { q } }
    );
    return data; // { err, data: string[] }
  },
};

export default employeeApi;
