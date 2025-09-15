import { Formik, Form } from "formik";
import InputField from "../../../components/forms/input/InputField";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import Button from "../../../components/forms/button/Button";
import { Toast } from "primereact/toast";
import axios from "../../../services/axios";
import apiUrl from "../../../constant/apiUrl";
import * as yup from "yup";

type Position = { id: number; code: string; value: string };

const DepartmentFormUpdate = ({
  data,
  employeeData: initialEmployees,
  closeModal,
}: any) => {
  const toast = useRef<Toast | null>(null);

  // Nhân viên trong phòng ban
  const [employeeData, setEmployeeData] = useState<any[]>(initialEmployees || []);
  // Danh sách chức vụ
  const [positions, setPositions] = useState<Position[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmployeeData(initialEmployees || []);
  }, [initialEmployees]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await axios.get(apiUrl.position.index);
        setPositions(res?.data?.data || []);
      } catch (e) {
        console.error("Failed to fetch positions", e);
      }
    };
    fetchPositions();
  }, []);

  const validationSchema = yup.object().shape({
    value: yup.string().required("Department name is required"),
  });

  const handleUpdateDepartment = async (values: any) => {
    try {
      setSaving(true);

      // 1) Cập nhật tên phòng ban
      await axios.put(`${apiUrl.department.index}/${data.id}`, { value: values.value });

      // 2) Cập nhật position cho nhân viên nếu thay đổi
      const patches = employeeData
        .filter((emp) => {
          const currentPosId = Number(emp?.position?.id ?? emp?.position_id);
          const nextPosId = Number(emp.position_id);
          return !Number.isNaN(nextPosId) && nextPosId !== currentPosId;
        })
        .map((emp) =>
          axios.patch(`${apiUrl.employee.index}/${emp.employee_id}`, {
            position_id: Number(emp.position_id),
          })
        );

      if (patches.length) await Promise.all(patches);

      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail:
          patches.length > 0
            ? "Department & employees updated successfully"
            : "Department updated successfully",
        life: 2200,
      });

      closeModal();
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update department or employees",
        life: 2200,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!data) return null;

  return (
    <div>
      <Toast ref={toast} />
      <Formik
        initialValues={{
          value: data?.value || "",
          id: data?.id || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleUpdateDepartment}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            {/* Department ID (readonly) */}
            <div className="form-item">
              <InputField
                type="text"
                name="ID_Department"
                placeholder="ID_Department"
                readOnly
                value={values.id}
              />
            </div>

            {/* Department Name */}
            <div className="form-item">
              <InputField
                type="text"
                name="Department"
                placeholder="Department"
                value={values.value}
                errorMessage={errors?.value && touched.value ? (errors.value as string) : ""}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setFieldValue("value", event.target.value)
                }
              />
            </div>

            {/* Employees table */}
            <div className="form-item">
              <h4>Employees in this department:</h4>

              {Array.isArray(employeeData) && employeeData.length > 0 ? (
                <table className="employee-table" style={{ width: "100%", marginTop: 8 }}>
                  <thead>
                    <tr>
                      {["#", "Employee ID", "Full Name", "Email", "Position"].map((h) => (
                        <th key={h} style={{ textAlign: "left" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {employeeData.map((employee, index) => {
                      const selectedPosId =
                        Number(employee.position_id ?? employee?.position?.id) || "";

                      return (
                        <tr key={employee.employee_id}>
                          <td>{index + 1}</td>

                          {/* 👇 THÊM CỘT HIỂN THỊ EMPLOYEE ID */}
                          <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                            {employee.employee_id}
                          </td>

                          <td>{employee.full_name}</td>
                          <td>{employee.email}</td>
                          <td>
                            <select
                              value={selectedPosId}
                              onChange={(e) => {
                                const nextId = Number(e.target.value);
                                setEmployeeData((prev) =>
                                  prev.map((it, i) =>
                                    i === index ? { ...it, position_id: nextId } : it
                                  )
                                );
                              }}
                            >
                              <option value="" disabled>
                                Choose position
                              </option>
                              {positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.value}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>No employees in this department.</p>
              )}
            </div>

            {/* Footer buttons */}
            <div
              className="form-footer"
              style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}
            >
              <Button type="submit" label={saving ? "Saving..." : "Submit"} disabled={saving} />
              <Button action="cancel" label="Cancel" className="ml-2" onClick={closeModal} />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DepartmentFormUpdate;
