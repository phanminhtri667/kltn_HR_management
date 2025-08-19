import 'primeicons/primeicons.css';
import { Link } from 'react-router-dom';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import axios from '../../../services/axios';
import apiUrl from '../../../constant/apiUrl';
const EmployeeTable = ({ ...props }) => {
  const { onDelete, onSelect, data } = props;

  const toast = useRef<Toast | null>(null);
  const deleteEmployee = async (id: string) => {
    try {
      const url = apiUrl.employee.update + id;
      const response = await axios.put(url);
      if (response) {
        onDelete();
        if (toast.current) {
          toast.current.show({
            severity: 'success',
            summary: 'Confirmed',
            detail: 'Deleted successfully',
            life: 1500,
          });
        }
      }
    } catch (error) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Confirmed',
          detail: 'Deleted error',
          life: 1500,
        });
      }
    }
  };

  const confirmDelete = (employee: Record<string, any>) => {
    confirmDialog({
      message: `Do you want to delete this employee ${employee.employee_id} ?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteEmployee(employee.employee_id),
      reject: () => {},
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>FULL NAME</th>
            <th>DEPARTMENT</th>
            <th>POSITION</th>
            <th>PHONE</th>
            <th>EMAIL</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item: Record<string, any>, index: number) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>#{item.employee_id}</td>
                  <td>{item.full_name}</td>
                  <td>{item.department?.value}</td>
                  <td>{item.position?.value}</td>
                  <td>{item.phone}</td>
                  <td>{item.email}</td>
                  <td>
                    <div className="table-acction">
                      <Link to={'/employee/1'}>
                        <i className="pi pi-eye pointer icon-hover"></i>
                      </Link>
                      <i
                        className="pi pi-pencil pointer icon-hover ml-3"
                        onClick={() => {
                          onSelect(item);
                        }}
                      ></i>

                      <i className="pi pi-trash pointer icon-hover ml-3" onClick={() => confirmDelete(item)}></i>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8}>
                <p style={{ textAlign: 'center' }}>No data</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default EmployeeTable;
