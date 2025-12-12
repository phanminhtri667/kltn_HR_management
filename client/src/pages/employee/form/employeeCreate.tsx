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

const initialValues = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
  dayOfBirth: "",
  phone: "",
  department_id: "",
  position_id: "",
};

// Chuẩn hoá YYYY-MM-DD
const toYMD = (input: string) => {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const [dd, mm, yyyy] = String(input).split(/[\/\-]/);
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

const validationSchema = yup.object().shape({
  full_name: yup.string().required("Employee name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  department_id: yup
    .number()
    .typeError("Department is required")
    .required("Department is required"),
  position_id: yup
    .number()
    .typeError("Position is required")
    .required("Position is required"),
});

const EmployeeCreate = () => {
  const departments = useSelector(
    (state: RootState) => state.departments.departments
  );
  const positions = useSelector(
    (state: RootState) => state.position.positions
  );

  const toast = useRef<Toast | null>(null);

  const handleAddEmployee = async (values: any, formik: any) => {
    try {
      const payload: any = {
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        password: values.password, // ✅ GỬI PASSWORD
        phone: values.phone?.trim() || "",
      };

      if (values.dayOfBirth) payload.dayOfBirth = toYMD(values.dayOfBirth);
      if (values.department_id !== "")
        payload.department_id = Number(values.department_id);
      if (values.position_id !== "")
        payload.position_id = Number(values.position_id);

      await axios.post(apiUrl.employee.index, payload);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Create employee successfully",
        life: 1500,
      });

      formik.resetForm();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Create employee failed",
        life: 1500,
      });
    }
  };

  return (
    <div>
      <Toast ref={toast} />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, formik) => handleAddEmployee(values, formik)}
      >
        {(formik) => {
          const { errors, touched, setFieldValue, values } = formik;

          return (
            <Form>
              <div className="form">
                <div className="form-item">
                  <InputField
                    type="text"
                    placeholder="Enter employee name"
                    value={values.full_name}
                    errorMessage={
                      touched.full_name ? (errors.full_name as string) : ""
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFieldValue("full_name", e.target.value)
                    }
                  />
                </div>

                <div className="form-item">
                  <InputField
                    type="email"
                    placeholder="Enter email"
                    value={values.email}
                    errorMessage={
                      touched.email ? (errors.email as string) : ""
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFieldValue("email", e.target.value)
                    }
                  />
                </div>

                {/* PASSWORD */}
                <div className="form-item">
                  <InputField
                    type="password"
                    placeholder="Enter password"
                    value={values.password}
                    errorMessage={
                      touched.password ? (errors.password as string) : ""
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFieldValue("password", e.target.value)
                    }
                  />
                </div>

                <div className="form-item">
                  <InputField
                    type="password"
                    placeholder="Confirm password"
                    value={values.confirm_password}
                    errorMessage={
                      touched.confirm_password
                        ? (errors.confirm_password as string)
                        : ""
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFieldValue("confirm_password", e.target.value)
                    }
                  />
                </div>

                <div className="form-item">
                  <InputField
                    type="date"
                    placeholder="Enter day of birth"
                    value={values.dayOfBirth}
                    errorMessage={
                      touched.dayOfBirth
                        ? (errors.dayOfBirth as string)
                        : ""
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFieldValue("dayOfBirth", e.target.value)
                    }
                  />
                </div>

                <div className="form-item">
                  <InputField
                    type="tel"
                    placeholder="Enter phone number"
                    value={values.phone}
                    errorMessage={
                      touched.phone ? (errors.phone as string) : ""
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFieldValue("phone", e.target.value)
                    }
                  />
                </div>

                <div className="form-item">
                  <SelectField
                    name="Department"
                    data={departments}
                    labelKey="value"
                    valueKey="id"
                    value={values.department_id}
                    errorMessage={
                      touched.department_id
                        ? (errors.department_id as string)
                        : ""
                    }
                    onChange={(e) =>
                      setFieldValue("department_id", Number(e.target.value))
                    }
                  />
                </div>

                <div className="form-item">
                  <SelectField
                    name="Position"
                    data={positions}
                    labelKey="value"
                    valueKey="id"
                    value={values.position_id}
                    errorMessage={
                      touched.position_id
                        ? (errors.position_id as string)
                        : ""
                    }
                    onChange={(e) =>
                      setFieldValue("position_id", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="form-footer">
                <Button type="submit" label="Submit" />
                <Button
                  action="cancel"
                  label="Cancel"
                  className="ml-2"
                  onClick={() => formik.resetForm()}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default EmployeeCreate;
