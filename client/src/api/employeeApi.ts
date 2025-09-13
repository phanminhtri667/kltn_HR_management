import AxiosInstance from '../services/axios';
import apiUrl from '../constant/apiUrl';

const employeeApi = {
  getEmployeesByDepartment: async (departmentId: number) => {
    const { data } = await AxiosInstance.get(
      `${apiUrl.employee.index}/department/${departmentId}`
    );
    return data; // { err, data }
  },
};

export default employeeApi;
