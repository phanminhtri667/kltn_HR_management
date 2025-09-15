import "primeicons/primeicons.css";
import { Link } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import axios from "../../../services/axios"; // AxiosInstance của bạn
import apiUrl from "../../../constant/apiUrl";

type Department = {
  id: number;
  code: string;
  value: string;
  deleted?: string;
  createdAt?: string;
};

type Props = {
  data: Department[];
  onDelete: () => void;
  onSelect: (dept: Department) => void;
};

const DepartmentTable = ({ data = [], onDelete, onSelect }: Props) => {
  const toast = useRef<Toast | null>(null);

  const deleteDepartment = async (id: number) => {
    try {
      const url = `${apiUrl.department.index}/${id}`;
      // “Xóa” = cập nhật cờ deleted = "1"
      const response = await axios.put(url, { deleted: "1" });
      if (response) {
        onDelete();
        toast.current?.show({
          severity: "success",
          summary: "Confirmed",
          detail: "Deleted successfully",
          life: 1500,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Deleted error",
        life: 1500,
      });
    }
  };

  const confirmDelete = (department: Department) => {
    confirmDialog({
      message: `Do you want to delete department ${department.code}?`,
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => deleteDepartment(department.id),
    });
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return "";
    // Hiển thị theo local time để dễ đọc
    return new Date(iso).toLocaleString();
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>CODE</th>
            <th>DEPARTMENT</th>
            <th>DATE CREATED</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={item.id ?? index}>
                <td>{index + 1}</td>
                <td>#{item.code}</td>
                <td>{item.value}</td>
                <td>{formatDateTime(item.createdAt)}</td>
                <td>
                  <div className="table-acction">
                    

                    <i
                      className="pi pi-pencil pointer icon-hover ml-3"
                      onClick={() => onSelect(item)}
                    />

                    
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <p style={{ textAlign: "center" }}>No data</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default DepartmentTable;
