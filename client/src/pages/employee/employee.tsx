import "./employee.scss";
import DefaultLayout from "../../layouts/DefaultLayout";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import EmployeeTable from "./table/EmployeeTable";
import { useEffect, useRef, useState } from "react";
import AxiosInstance from "../../services/axios";
import apiUrl from "../../constant/apiUrl";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import EmployeeFormCreate from "./form/employeeCreate";
import EmployeeFormUpdate from "./form/employeeUpdate";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const Employee = () => {
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [q, setQ] = useState<string>("");

  const [infoDataEmployee, setInfoDataEmployee] = useState<Record<string, any>>({});
  const [employeeSelected, setEmployeeSelected] = useState<Record<string, any>>({});
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    getEmployee();
  }, []);

  const getEmployee = async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user'); // Lấy thông tin người dùng từ localStorage
  
    // Kiểm tra role và department_id
    const role = user ? JSON.parse(user).role_code : null;
    const department_id = user ? JSON.parse(user).department_id : null;
  
    let url = apiUrl.employee.index; // Default URL cho admin
  
    // Nếu là Leader (role_2), chỉ lấy nhân viên thuộc phòng ban của Leader
    if (role === 'role_2' && department_id) {
      url = `${apiUrl.employee.department}/${department_id}`; // Lấy nhân viên trong cùng phòng ban của Leader
    }
  
    // Gọi API để lấy dữ liệu nhân viên
    try {
      const result = await AxiosInstance.get(url);
  
      if (result.data) {
        const rows = result.data.data || [];
        setEmployeeData(rows);
        setFiltered(rows); // Đồng bộ dữ liệu ban đầu cho bảng
        statisticalEmployee(rows);
      }
    } catch (error) {
      console.error("Error fetching employee data: ", error);
    }
  };
  

  const statisticalEmployee = (data: Record<string, any>[]) => {
    const now = new Date().getTime();
    const newEmployee = data.filter((emp: Record<string, any>) => {
      const timeCreate = new Date(emp.createdAt).getTime();
      return now - timeCreate < 1000 * 60 * 60 * 24;
    });
    const male = data.filter((emp: Record<string, any>) => emp.gender === "male");
    const statistical = {
      newEmployee: newEmployee.length,
      male: male.length,
      female: data.length - male.length,
    };
    setInfoDataEmployee(statistical);
  };

  // Lọc theo employee_id với debounce
  useEffect(() => {
    const h = setTimeout(() => {
      const keyword = q.trim().toLowerCase();
      if (!keyword) {
        setFiltered(employeeData);
        return;
      }
      setFiltered(
        employeeData.filter((e: any) =>
          String(e.employee_id || "").toLowerCase().includes(keyword)
        )
      );
    }, 250);
    return () => clearTimeout(h);
  }, [q, employeeData]);

  const clearSearch = () => {
    setQ("");
    setFiltered(employeeData);
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
                    <span className="card-body-content fs-2xl">
                      {infoDataEmployee.newEmployee}
                    </span>
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

            {/* Thanh tìm kiếm kiểu Timekeeping (ô nhập + nút Clear) */}
            {/* Thanh tìm kiếm mini */}
<Card className="search-card">
  <div className="search-bar">
    <span className="p-input-icon-left">
      <i className="pi pi-search" />
      <InputText
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by Employee ID (e.g., AD0001)"
        className="p-inputtext-sm search-input"
      />
    </span>
    <Button
      label="Clear"
      className="p-button-secondary p-button-sm clear-button"
      onClick={clearSearch}
      type="button"
    />
  </div>
</Card>


            <div className="employee-table">
              <Card>
                <EmployeeTable
                  data={filtered}
                  onDelete={getEmployee}
                  onSelect={handleSelectedEmployee}
                />
              </Card>
            </div>
          </TabPanel>

          <TabPanel header="Add Employee">
            <EmployeeFormCreate />
          </TabPanel>
        </TabView>

        <Dialog
          header="Edit employee"
          visible={visible}
          style={{ width: "50vw" }}
          onHide={() => setVisible(false)}
        >
          <EmployeeFormUpdate
            data={employeeSelected}
            closeModal={() => setVisible(false)}
            getEmployee={getEmployee}
          />
        </Dialog>
      </DefaultLayout>
      <Toast ref={toast} />
    </>
  );
};

export default Employee;
