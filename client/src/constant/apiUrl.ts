const api = process.env.REACT_APP_API_URL;


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
  timekeeping: { 
    index: `${api}/timekeeping`,           
    mine: `${api}/timekeeping/mine`,         
    department: `${api}/timekeeping/department`, 
    checkIn: `${api}/timekeeping`,               
    checkOut: `${api}/timekeeping/checkout`,  
    getAll: `${api}/timekeeping`,
     
  },
  payroll: { 
    index: `${api}/payroll`,       
     mine:  `${api}/payroll/me`,  
  },
  leave: {
    create: "/api/leaves",
    my: "/api/leaves/my",
    getAll: "/api/leaves",
    approve: "/api/leaves",
    reject: "/api/leaves",
  },
  payroll_changes: {
    index: `${api}/payroll-changes`,          // GET danh sách change logs (có thể truyền ?month=&employee_id=&department_id=)
    byPayroll: `${api}/payroll-changes/by-payroll`, // (tùy bạn có route này hay không)
    detail: `${api}/payroll-changes/`,        // GET /payroll-changes/:id (nếu có dùng)
  },
  contracts: {
    base: `${api}/contracts`,
    statuses: `${api}/contracts/statuses`,
    detail: (id:number)=>`${api}/contracts/${id}`,
    updateDraft: (id:number)=>`${api}/contracts/${id}/draft`,
// submitApproval: (id: number) => `${api}/contracts/${id}/submit-approval`,
    approve: (id:number)=>`${api}/contracts/${id}/approve`,
    setSigners: (id:number)=>`${api}/contracts/${id}/signers`,
    sendForSigning: (id:number)=>`${api}/contracts/${id}/send-for-signing`,
    sign: (id:number, order:number)=>`${api}/contracts/${id}/sign/${order}`,
// activate: (id: number) => `${api}/contracts/${id}/activate`,
    terminate: (id:number)=>`${api}/contracts/${id}/terminate`,
    amendments: (id:number)=>`${api}/contracts/${id}/amendments`,
    attachments: (id:number)=>`${api}/contracts/${id}/attachments`,
    audits: (id:number)=>`${api}/contracts/${id}/audits`,
    // ⭐ NEW
    createForm: `${api}/contracts/create-form`,
    templates: `${api}/contracts/templates`,
    legalEntity: { index: `${api}/legal-entities` },
  },
};

export default apiUrl;
