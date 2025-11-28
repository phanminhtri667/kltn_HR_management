import './department.scss';
import DefaultLayout from '../../layouts/DefaultLayout';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import DepartmentTable from './table/departmentTable';
import { useEffect, useRef, useState } from 'react';
import AxiosInstance from '../../services/axios';
import apiUrl from '../../constant/apiUrl';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import DepartmentFormUpdate from './form/departmentUpdate';
import DepartmentFormCreate from './form/departmentCreate';
import employeeApi from '../../api/employeeApi';

const Department = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [departmentSelected, setDepartmentSelected] = useState<Record<string, any>>({});
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    getDepartment();
  }, []);

  // ✅ Lấy danh sách nhân viên theo departmentId
const getEmployees = async (departmentId: number) => {
  try {
    const result = await employeeApi.getEmployeesByDepartment(departmentId);
    setEmployeeData(result?.data || []);
  } catch { setEmployeeData([]); }
};




  // Lấy danh sách phòng ban
  const getDepartment = async () => {
    const result = await AxiosInstance.get(apiUrl.department.index);
    if (result.data) {
      setDepartmentData(result.data.data);
    }
  };

  // Khi chọn 1 department để edit
  const handleSelectedDepartment = (department: any) => {
  setDepartmentSelected(department);
  getEmployees(department.id);   // 🔥 dùng id thay vì code
  setVisible(true);
};

  return (
    <DefaultLayout>
      <TabView>
        <TabPanel header="List Department">
          <div className="department-table">
            <Card>
              <DepartmentTable
                data={departmentData}
                onDelete={getDepartment}
                onSelect={handleSelectedDepartment}
              />
            </Card>
          </div>
        </TabPanel>
        <TabPanel header="Add Department">
          <DepartmentFormCreate />
        </TabPanel>
      </TabView>

      {/* Dialog update */}
      <Dialog
        header="Edit Department"
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
      >
        <DepartmentFormUpdate
          data={departmentSelected}
          employeeData={employeeData}
          closeModal={() => setVisible(false)}
        />
      </Dialog>
    </DefaultLayout>
  );
};

export default Department;
