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
  },
  payroll: { 
    index: `${api}/payroll`,       // Endpoint lấy tất cả bảng lương
     mine:  `${api}/payroll/me`,  // Endpoint lấy bảng lương của chính mình
  },
  payroll_changes: {
    index: `${api}/payroll-changes`,          // GET danh sách change logs (có thể truyền ?month=&employee_id=&department_id=)
    byPayroll: `${api}/payroll-changes/by-payroll`, // (tùy bạn có route này hay không)
    detail: `${api}/payroll-changes/`,        // GET /payroll-changes/:id (nếu có dùng)
  },
  contracts: {
    base: `${api}/contracts`,                         // GET list, POST create
    detail: (id: number) => `${api}/contracts/${id}`, // GET chi tiết

    // Draft update (Manager/Admin)
    updateDraft: (id: number) => `${api}/contracts/${id}/draft`,

    // Quy trình duyệt & gửi ký
    submitApproval: (id: number) => `${api}/contracts/${id}/submit-approval`,
    approve: (id: number) => `${api}/contracts/${id}/approve`,
    setSigners: (id: number) => `${api}/contracts/${id}/signers`,
    sendForSigning: (id: number) => `${api}/contracts/${id}/send-for-signing`,
    sign: (id: number, order: number) => `${api}/contracts/${id}/sign/${order}`,

    // Kích hoạt / Chấm dứt
    activate: (id: number) => `${api}/contracts/${id}/activate`,
    terminate: (id: number) => `${api}/contracts/${id}/terminate`,

    // Phụ lục, tệp đính kèm, nhật ký
    amendments: (id: number) => `${api}/contracts/${id}/amendments`,   // POST tạo phụ lục
    attachments: (id: number) => `${api}/contracts/${id}/attachments`, // GET danh sách / POST thêm
    audits: (id: number) => `${api}/contracts/${id}/audits`,           // GET audit logs
  },
};

export default apiUrl;
