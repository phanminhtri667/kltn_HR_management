// client/src/pages/employee/table/EmployeeTable.tsx
import "primeicons/primeicons.css";
import { Link } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import AxiosInstance from "../../../services/axios";
import apiUrl from "../../../constant/apiUrl";

type Props = {
  data: any[];                              // <-- dùng trực tiếp, KHÔNG tạo state copy
  onDelete: () => void;
  onSelect: (employee: any) => void;
};

const EmployeeTable = ({ data, onDelete, onSelect }: Props) => {
  const toast = useRef<Toast | null>(null);

  const deleteEmployee = async (employeeId: string) => {
    try {
      await AxiosInstance.put(`${apiUrl.employee.update}${employeeId}`, {}); // BE: soft delete
      onDelete?.();
      toast.current?.show({
        severity: "success",
        summary: "Confirmed",
        detail: "Deleted successfully",
        life: 1500,
      });
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Delete failed",
        life: 1500,
      });
    }
  };

  const confirmDelete = (employee: any) => {
    confirmDialog({
      message: `Do you want to delete employee ${employee.employee_id}?`,
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => deleteEmployee(employee.employee_id),
    });
  };

  const rows = Array.isArray(data) ? data : [];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((item: any, index: number) => (
              <tr key={item.employee_id}>
                <td>{index + 1}</td>
                <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  {item.employee_id}
                </td>
                <td>{item.full_name}</td>
                <td>{item.department?.value}</td>
                <td>{item.position?.value}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>
                  <div className="table-acction">
                    <Link to={`/employee/${item.employee_id}`}>
                      <i className="pi pi-eye pointer icon-hover" />
                    </Link>
                    <i
                      className="pi pi-pencil pointer icon-hover ml-3"
                      onClick={() => onSelect?.(item)}
                    />
                    <i
                      className="pi pi-trash pointer icon-hover ml-3"
                      onClick={() => confirmDelete(item)}
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8}>
                <p style={{ textAlign: "center" }}>No data</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default EmployeeTable;
