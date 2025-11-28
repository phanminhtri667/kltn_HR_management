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


const initialValues = {
  full_name: "",
  email: "",
  dayOfBirth: "",
  phone: "",
  department_id: "",
  position_id: "",
};

// Chuẩn hoá YYYY-MM-DD (phòng khi browser trả khác)
const toYMD = (input: string) => {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const [dd, mm, yyyy] = String(input).split(/[\/\-]/);
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

const EmployeeCreate = () => {
  const departments = useSelector((state: RootState) => state.departments.departments);
  const positions = useSelector((state: RootState) => state.position.positions);
  const toast = useRef<Toast | null>(null);

  const validationSchema = yup.object().shape({
    full_name: yup.string().required(" is a required field"),
    email: yup.string().email("invalid email").required(" is a required field"),
    department_id: yup.number().typeError("Department is required").required("Department is required"),
    position_id: yup.number().typeError("Position is required").required("Position is required"),
  });

  const handleAddEmployee = async (values: any, formik: any) => {
    try {
      // Chuẩn hóa payload: ép số & định dạng ngày
      const payload: any = {
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || "",
      };
      if (values.dayOfBirth) payload.dayOfBirth = toYMD(values.dayOfBirth);
      if (values.department_id !== "") payload.department_id = Number(values.department_id);
      if (values.position_id !== "") payload.position_id = Number(values.position_id);

      await axios.post(apiUrl.employee.index, payload);

      toast.current?.show({
        severity: "success",
        summary: "Confirmed",
        detail: "Create successfully",
        life: 1500,
      });
      formik.resetForm();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Confirmed",
        detail: "Create error",
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
                    placeholder="Enter email"
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
                  {/* dùng tel để không mất số 0 đầu */}
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
                    data={departments}         // mảng từ store: [{id, code, value}, ...] hoặc string[]
                    labelKey="value"           // hiển thị tên phòng ban
                    valueKey="id"              // gửi id số
                    value={values.department_id}
                    errorMessage={errors?.department_id && touched.department_id ? (errors.department_id as string) : ""}
                    onChange={(e) => setFieldValue("department_id", Number(e.target.value))}
                  />
                </div>

                <div className="form-item">
                  <SelectField
                    name="Position"
                    data={positions}           // [{id, code, value}, ...] hoặc string[]
                    labelKey="value"
                    valueKey="id"
                    value={values.position_id}
                    errorMessage={errors?.position_id && touched.position_id ? (errors.position_id as string) : ""}
                    onChange={(e) => setFieldValue("position_id", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-footer">
                <Button type="submit" label="Submit" />
                <Button action="cancel" label="Cancel" className="ml-2" onClick={() => formik.resetForm()} />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default EmployeeCreate;
