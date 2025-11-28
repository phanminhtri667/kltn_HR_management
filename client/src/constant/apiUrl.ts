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
    mine: `${api}/payroll/me`,

    // FE gọi API chỉnh ngày cron
    settings: {
      list: `${api}/payroll/settings`,                         // GET /payroll/settings
      get: (key: string): string => `${api}/payroll/settings/${key}`,      // GET /payroll/settings/:key
      update: (key: string): string => `${api}/payroll/settings/${key}`,   // PUT /payroll/settings/:key
    },
  },
  // 🔥 SỬA LỖI LỚN Ở ĐÂY
  leave: {
    create: `${api}/leaves`,
    my: `${api}/leaves/my`,
    getAll: `${api}/leaves`,
    approve: `${api}/leaves`,
    reject: `${api}/leaves`,
  },

  payroll_changes: {
    index: `${api}/payroll-changes`,
    byPayroll: `${api}/payroll-changes/by-payroll`,
    detail: `${api}/payroll-changes/`,
  },

  contracts: {
  base: `${api}/contracts`,
  statuses: `${api}/contracts/statuses`,
  detail: (id:number)=>`${api}/contracts/${id}`,
  updateDraft: (id:number)=>`${api}/contracts/${id}/draft`,
  setSigners: (id:number)=>`${api}/contracts/${id}/signers`,
  sendForSigning: (id:number)=>`${api}/contracts/${id}/send-for-signing`,
  sign: (id:number, order:number)=>`${api}/contracts/${id}/sign/${order}`,
  terminate: (id:number)=>`${api}/contracts/${id}/terminate`,
  cancel: (id:number)=>`${api}/contracts/${id}/cancel`,          // ⬅️ ADD
  finalize: (id:number)=>`${api}/contracts/${id}/finalize`,      // ⬅️ ADD
  amendments: (id:number)=>`${api}/contracts/${id}/amendments`,
  attachments: (id:number)=>`${api}/contracts/${id}/attachments`,
  audits: (id:number)=>`${api}/contracts/${id}/audits`,
  createForm: `${api}/contracts/create-form`,
  templates: `${api}/contracts/templates`,
  legalEntity: { index: `${api}/legal-entities` },
},

};

export default apiUrl;
