import { Formik, Form } from "formik";
import InputField from "../../../components/forms/input/InputField";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import Button from "../../../components/forms/button/Button";
import { Toast } from "primereact/toast";
import axios from "../../../services/axios";
import apiUrl from "../../../constant/apiUrl";
import * as yup from "yup";

const DepartmentFormUpdate = ({ data, employeeData: initialEmployees, closeModal }: any) => {
  const toast = useRef<Toast | null>(null);
  const [employeeData, setEmployeeData] = useState<any[]>(initialEmployees || []);

  useEffect(() => {
    setEmployeeData(initialEmployees || []);
  }, [initialEmployees]);

  const validationSchema = yup.object().shape({
    value: yup.string().required("Department name is required"),
  });

  const handleUpdateDepartment = async (values: any) => {
    try {
      // 1. Cập nhật phòng ban (dùng id thay cho code)
      await axios.put(`${apiUrl.department.index}/${data.id}`, values);

      // 2. Cập nhật position_id cho từng nhân viên trong phòng ban
      for (const emp of employeeData) {
        await axios.patch(`${apiUrl.employee.index}/${emp.employee_id}`, {
          position_id: emp.position_id,
        });
      }

      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail: "Department & Employees updated successfully",
        life: 2000,
      });

      closeModal();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update department or employees",
        life: 2000,
      });
    }
  };

  if (!data) return null;

  return (
    <div>
      <Toast ref={toast} />
      <Formik
        initialValues={{
          value: data?.value || "",
          id: data?.id || "",  // ✅ thay code bằng id
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => handleUpdateDepartment(values)}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            {/* Department Name */}
            <div className="form-item">
              <InputField
                type="text"
                name="value"
                placeholder="Enter department"
                value={values.value}
                errorMessage={errors?.value && touched.value ? errors.value : ""}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setFieldValue("value", event.target.value)
                }
              />
            </div>

            {/* Department ID (readonly) */}
            <div className="form-item">
              <InputField
                type="text"
                name="id"
                placeholder="Department ID"
                readOnly
                value={values.id}
              />
            </div>

            {/* Employee list */}
            <div className="form-item">
              <h4>Employees in this department:</h4>
              {Array.isArray(employeeData) && employeeData.length > 0 ? (
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeData.map((employee, index) => (
                      <tr key={employee.employee_id}>
                        <td>{index + 1}</td>
                        <td>{employee.full_name}</td>
                        <td>{employee.email}</td>
                        <td>
                          <select
                            value={employee.position_id}
                            onChange={(e) => {
                              const updated = [...employeeData];
                              updated[index].position_id = e.target.value;
                              setEmployeeData(updated);
                            }}
                          >
                            <option value="CVLD">Leader</option>
                            <option value="CVMB">Member</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No employees in this department.</p>
              )}
            </div>

            {/* Footer buttons */}
            <div
              className="form-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <Button type="submit" label="Submit" />
              <Button
                action="cancel"
                label="Cancel"
                className="ml-2"
                onClick={closeModal}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DepartmentFormUpdate;
