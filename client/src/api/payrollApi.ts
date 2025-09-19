import AxiosInstance from "../services/axios";
import apiUrl from "../constant/apiUrl";

// Định nghĩa kiểu cho params
interface PayrollParams {
  month?: string;
  department_id?: number;
  employee_id?: string;
}

// Lấy tất cả bảng lương
const getAllPayrolls = async (params: PayrollParams) => {
  try {
    const response = await AxiosInstance.get(apiUrl.payroll.index, { params });
    
    // Kiểm tra nếu response có dữ liệu
    if (response.data && response.data.data) {
      return response.data.data;  // Trả về dữ liệu bảng lương
    } else {
      throw new Error("No payroll data found.");
    }
  } catch (error: any) {
    // Log lỗi với chi tiết đầy đủ
    console.error("Error getting payrolls:", error.message);
    throw new Error(`Failed to get payrolls: ${error.message}`);
  }
};

export default {
  getAllPayrolls,
};
