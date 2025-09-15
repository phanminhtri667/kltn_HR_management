import { Formik, Form } from "formik";
import { Toast } from "primereact/toast";
import { ChangeEvent, useRef } from "react";
import { useSelector } from "react-redux";
import * as yup from "yup";
import Button from "../../../components/forms/button/Button";
import InputField from "../../../components/forms/input/InputField";
import SelectField from "../../../components/forms/select/selectField";
import apiUrl from "../../../constant/apiUrl";
import { RootState } from "../../../redux/store";
import axios from "../../../services/axios";
import { employeeSchema } from "../../../validation/employee";


// Chuẩn hoá ngày về YYYY-MM-DD
const toYMD = (input: string | Date) => {
  if (!input) return "";
  if (input instanceof Date) return input.toISOString().slice(0, 10);
  const s = String(input);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const [dd, mm, yyyy] = s.split(/[\/\-]/);
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

type Props = {
  data: any;
  closeModal: () => void;
  getEmployee: () => void;
};

const EmployeeFormUpdate = ({ data, closeModal, getEmployee }: Props) => {
  const departments = useSelector((state: RootState) => state.departments.departments);
  const positions = useSelector((state: RootState) => state.position.positions);
  const toast = useRef<Toast | null>(null);

  if (!data) return null;

  const initialValues = {
    employee_id: data.employee_id,
    full_name: data.full_name || "",
    email: data.email || "",
    dayOfBirth: data.dayOfBirth ? new Date(data.dayOfBirth).toISOString().slice(0, 10) : "",
    phone: data.phone || "",
    department_id: Number(data?.department?.id ?? data?.department_id ?? ""),
    position_id: Number(data?.position?.id ?? data?.position_id ?? ""),
    gender: data.gender || "",
  };

  const validationSchema = yup.object().shape({
    full_name: yup.string().required(" is a required field"),
    email: yup.string().email("invalid email").required("is a required field"),
  });

  const handleSubmit = async (values: any) => {
    try {
      const body: any = {};

      if (values.full_name) {
        const full = values.full_name.trim();
        body.full_name = full;
        body.first_name = full.split(" ").pop();
      }
      if (values.email) body.email = values.email.trim();
      if (values.phone) body.phone = values.phone.trim();
      if (values.gender) body.gender = values.gender;
      if (values.dayOfBirth) body.dayOfBirth = toYMD(values.dayOfBirth);

      if (values.department_id !== "" && values.department_id !== undefined)
        body.department_id = Number(values.department_id);
      if (values.position_id !== "" && values.position_id !== undefined)
        body.position_id = Number(values.position_id);

      await axios.patch(`${apiUrl.employee.update}${values.employee_id}`, body);

      toast.current?.show({
        severity: "success",
        summary: "Confirmed",
        detail: "Edit successfully",
        life: 1500,
      });
      getEmployee();
      closeModal();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Edit failed",
        life: 1500,
      });
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <Formik
        initialValues={initialValues}
        validationSchema={employeeSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formik) => {
          const { errors, touched, setFieldValue, dirty, isValid, values } = formik;
          return (
            <Form>
              <div className="form">
                <div className="form-item">
                  <InputField
                    type="text"
                    name="Employee name"
                    placeholder="Enter employee name"
                    value={values.full_name}
                    errorMessage={errors?.full_name && touched.full_name ? (errors.full_name as string) : ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("full_name", e.target.value)}
                  />
                </div>

                <div className="form-item">
                  <InputField
                    type="text"
                    name="Email"
                    placeholder="Enter Email"
                    readOnly
                    value={values.email}
                    errorMessage={errors?.email && touched.email ? (errors.email as string) : ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("email", e.target.value)}
                  />
                </div>

                <div className="form-item">
                  <InputField
                    type="date"
                    name="Day of birth"
                    placeholder="Enter day of birth"
                    value={values.dayOfBirth}
                    errorMessage={errors?.dayOfBirth && touched.dayOfBirth ? (errors.dayOfBirth as string) : ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("dayOfBirth", e.target.value)}
                  />
                </div>

                <div className="form-item">
                  <InputField
                    type="tel"
                    name="Phone"
                    placeholder="Enter phone number"
                    value={values.phone}
                    errorMessage={errors?.phone && touched.phone ? (errors.phone as string) : ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("phone", e.target.value)}
                  />
                </div>

                <div className="form-item">
                  <SelectField
                    name="Department"
                    data={departments}
                    labelKey="value"
                    valueKey="id"
                    value={values.department_id}
                    onChange={(e) => setFieldValue("department_id", Number(e.target.value))}
                  />
                </div>

                <div className="form-item">
                  <SelectField
                    name="Position"
                    data={positions}
                    labelKey="value"
                    valueKey="id"
                    value={values.position_id}
                    onChange={(e) => setFieldValue("position_id", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-footer float-right">
                <Button type="submit" label="Submit" disabled={!(dirty && isValid)} />
                <Button action="cancel" label="Cancel" className="ml-2" onClick={closeModal} />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default EmployeeFormUpdate;
