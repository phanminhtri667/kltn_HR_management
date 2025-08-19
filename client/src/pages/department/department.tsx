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

const Department = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [infoDataDepartment, setInfoDataDepartment] = useState<
    Record<string, any>
  >({});
  const [departmentSelected, setDepartmentSelected] = useState<
    Record<string, any>
  >({});
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    getDepartment();
  }, []);

  const getDepartment = async () => {
    const result = await AxiosInstance.get(apiUrl.department.index);
    if (result.data) {
      setDepartmentData(result.data.data);
      console.log(result.data.data);
    }
  };

  const handleSelectedDepartment = (department: any) => {
    setDepartmentSelected(department);
    setVisible(true);
  };

  return (
    <>
      <DefaultLayout>
        <TabView>
          <TabPanel header="List Department">
            <div className="department-container"></div>
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
        <Dialog
          header="Edit Department"
          visible={visible}
          style={{ width: '50vw' }}
          onHide={() => setVisible(false)}
        >
          <DepartmentFormUpdate
            data={departmentSelected}
            closeModal={() => setVisible(false)}
          />
        </Dialog>
      </DefaultLayout>
    </>
  );
};

export default Department;
