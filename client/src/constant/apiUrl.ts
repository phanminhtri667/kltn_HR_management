const api = "api";

const apiUrl = {
  notification: {
    index: `${api}/notification`,
  },
  employee: {
    index: `${api}/employee`,
    update: `${api}/employee/`,
  },
  department: {
    index: `${api}/department`,
  },
  position: {
    index: `${api}/position`,
  },
  working_hours: {                         // ✅ thêm block này
    index: `${api}/working-hours`,
  },
  timekeeping: {                           // ✅ nếu sau này cần chấm công
    index: `${api}/timekeeping`,
  },
  payroll: {  // ✅ Thêm block payroll vào đây
    index: `${api}/payroll`,       // Endpoint lấy tất cả bảng lương
  },
};

export default apiUrl;
