import './employee.scss';
import DefaultLayout from '../../layouts/DefaultLayout';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import EmployeeTable from './table/EmployeeTable';
import { useEffect, useRef, useState } from 'react';
import AxiosInstance from '../../services/axios';
import apiUrl from '../../constant/apiUrl';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import EmployeeFormCreate from './form/employeeCreate';
import EmployeeFormUpdate from './form/employeeUpdate';

const Employee = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [infoDataEmployee, setInfoDataEmployee] = useState<Record<string, any>>({});
  const [employeeSelected, setEmployeeSelected] = useState<Record<string, any>>({});
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    getEmployee();
  }, []);

  const getEmployee = async () => {
    const result = await AxiosInstance.get(apiUrl.employee.index);
    if (result.data) {
      setEmployeeData(result.data.data);
      console.log(result.data.data);
      statisticalEmployee(result.data.data);
    }
  };

  const statisticalEmployee = (data: Record<string, any>[]) => {
    const now = new Date().getTime();
    const newEmployee = data.filter((emp: Record<string, any>) => {
      const timeCreate = new Date(emp.createdAt).getTime();
      return now - timeCreate < 1000 * 60 * 60 * 24;
    });
    const male = data.filter((emp: Record<string, any>) => emp.gender === 'male');
    const statistical = {
      newEmployee: newEmployee.length,
      male: male.length,
      female: data.length - male.length,
    };
    setInfoDataEmployee(statistical);
  };

  const handleSelectedEmployee = (employee: any) => {
    setEmployeeSelected(employee);
    setVisible(true);
  };

  return (
    <>
      <DefaultLayout>
        <TabView>
          <TabPanel header="List Employee">
            <div className="employee-container">
              <div className="employee-header">
                <Card>
                  <div className="card-body pointer">
                    <span className="card-body-name fs-l">Total Employee</span>
                    <span className="card-body-content fs-2xl">{employeeData.length}</span>
                  </div>
                </Card>
                <Card>
                  <div className="card-body pointer">
                    <span className="card-body-name fs-l">New Employee</span>
                    <span className="card-body-content fs-2xl">{infoDataEmployee.newEmployee}</span>
                  </div>
                </Card>
                <Card>
                  <div className="card-body pointer">
                    <span className="card-body-name fs-l">Male</span>
                    <span className="card-body-content fs-2xl">{infoDataEmployee.male}</span>
                  </div>
                </Card>
                <Card>
                  <div className="card-body pointer">
                    <span className="card-body-name fs-l">Female</span>
                    <span className="card-body-content fs-2xl">{infoDataEmployee.female}</span>
                  </div>
                </Card>
              </div>
            </div>
            <div className="employee-table">
              <Card>
                <EmployeeTable data={employeeData} onDelete={getEmployee} onSelect={handleSelectedEmployee} />
              </Card>
            </div>
          </TabPanel>
          <TabPanel header="Add Employee">
            <EmployeeFormCreate />
          </TabPanel>
        </TabView>
        <Dialog header="Edit employee" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
          <EmployeeFormUpdate data={employeeSelected} closeModal={() => setVisible(false)} getEmployee={getEmployee} />
        </Dialog>
      </DefaultLayout>
    </>
  );
};

export default Employee;
