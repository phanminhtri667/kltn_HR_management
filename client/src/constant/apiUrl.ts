const api = "api";

const apiUrl = {
  notification: {
    index: `${api}/notification`,
  },
  employee: {
    index: `${api}/employee`,
    department: `${api}/employee/department`,
    update: `${api}/employee/`,
  },
  department: {
    index: `${api}/department`,
  },
  position: {
    index: `${api}/position`,
  },
  working_hours: {                         
    index: `${api}/working-hours`,
  },
  timekeeping: {                           // ✅ nếu sau này cần chấm công
    index: `${api}/timekeeping`,
  },
  payroll: { 
    index: `${api}/payroll`,       // Endpoint lấy tất cả bảng lương
     mine:  `${api}/payroll/me`,  // Endpoint lấy bảng lương của chính mình
  },
};

export default apiUrl;
