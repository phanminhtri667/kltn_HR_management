import "primeicons/primeicons.css";
import { Link } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import axios from "../../../services/axios";
import apiUrl from "../../../constant/apiUrl";
// import _ from "lodash";
const DepartmentTable = ({ ...props }) => {
  const { onDelete, onSelect, data } = props;

  const toast = useRef<Toast | null>(null);
  const deleteDepartment = async (id: string) => {
    try {
      const url = apiUrl.department.index + "/" + id;
      const response = await axios.put(url);
      if (response) {
        onDelete();
        if (toast.current) {
          toast.current.show({
            severity: "success",
            summary: "Confirmed",
            detail: "Deleted successfully",
            life: 1500,
          });
        }
      }
    } catch (error) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Confirmed",
          detail: "Deleted error",
          life: 1500,
        });
      }
    }
  };

  const confirmDelete = (department: Record<string, any>) => {
    confirmDialog({
      message: `Do you want to delete this department ${department.department_id} ?`,
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => deleteDepartment(department.department_id),
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
            <th>CODE</th>
            <th>DEPARTMENT</th>
            <th>DATE CREATED</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item: Record<string, any>, index: number) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>#{item.code}</td>
                  <td>{item.value}</td>
                  <td>
                    {new Date(item.createdAt)
                      .toISOString()
                      .replace("T", " ")
                      .substr(0, 19)}
                  </td>

                  <td>
                    <div className="table-acction">
                      <Link to={"/department/1"}>
                        <i className="pi pi-eye pointer icon-hover"></i>
                      </Link>
                      <i
                        className="pi pi-pencil pointer icon-hover ml-3"
                        onClick={() => {
                          onSelect(item);
                        }}></i>

                      <i
                        className="pi pi-trash pointer icon-hover ml-3"
                        onClick={() => confirmDelete(item)}></i>
                    </div>
                  </td>
                </tr>
              );
            })
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

export default DepartmentTable;
