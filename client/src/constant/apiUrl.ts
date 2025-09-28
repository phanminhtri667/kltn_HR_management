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
  timekeeping: { // Đổi endpoint cho phù hợp với các route đã thay đổi trong Backend
    index: `${api}/timekeeping`,             // Lấy tất cả dữ liệu chấm công (dành cho Admin)
    mine: `${api}/timekeeping/mine`,         // Lấy chấm công của chính người dùng (dành cho role_3)
    department: `${api}/timekeeping/department`, // Lấy chấm công theo phòng ban (dành cho role_2 và role_1)
    checkIn: `${api}/timekeeping`,               // NEW: POST check-in
    checkOut: `${api}/timekeeping/checkout`,   
  },
  payroll: { 
    index: `${api}/payroll`,       // Endpoint lấy tất cả bảng lương
     mine:  `${api}/payroll/me`,  // Endpoint lấy bảng lương của chính mình
  },
};

export default apiUrl;
