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
};

export default apiUrl;
