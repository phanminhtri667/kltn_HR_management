import { Formik, Form } from "formik";
import InputField from "../../../components/forms/input/InputField";
import { ChangeEvent, useRef } from "react";
import SelectField from "../../../components/forms/select/selectField";
import { useSelector } from "react-redux";
import Button from "../../../components/forms/button/Button";
import { Card } from "primereact/card";
import axios from "../../../services/axios";
import apiUrl from "../../../constant/apiUrl";
import * as yup from "yup";
import { Toast } from "primereact/toast";
import { RootState } from "../../../redux/store";

let initialValues = {
  full_name: "",
  email: "",
  dayOfBirth: "",
  phone: "",
  department_id: "",
  position_id: "",
};
const EmployeeFormCreate = () => {
  const departments = useSelector(
    (state: RootState) => state.departments.departments
  );
  const positions = useSelector((state: RootState) => state.position.positions);
  const toast = useRef<Toast | null>(null);

  const validationSchema = yup.object().shape({
    full_name: yup.string().required(" is a required field"),
    email: yup.string().email("invalid email").required(" is a required field"),
  });

  const handleAddEmployee = async (values: any, formik: any) => {
    try {
      const response = await axios.post(apiUrl.employee.index, values);
      if (response) {
        if (toast.current) {
          toast.current.show({
            severity: "success",
            summary: "Confirmed",
            detail: "Create successfully",
            life: 1500,
          });
        }
        formik.resetForm();
      }
    } catch (error) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Confirmed",
          detail: "Create error",
          life: 1500,
        });
      }
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, formik) => {
          handleAddEmployee(values, formik);
        }}>
        {(formik) => {
          const { errors, touched, setFieldValue } = formik;
          return (
            <Form>
              <Card>
                <div className="form">
                  <div className="form-item">
                    <InputField
                      type="text"
                      name="Employee name"
                      placeholder="Enter employee name"
                      value={formik.values.full_name}
                      errorMessage={
                        errors?.full_name && touched.full_name
                          ? errors?.full_name
                          : ""
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("full_name", event.target.value);
                      }}
                    />
                  </div>
                  <div className="form-item">
                    <InputField
                      type="text"
                      name="Email"
                      placeholder="Enter email"
                      value={formik.values.email}
                      errorMessage={
                        errors?.email && touched.email ? errors?.email : ""
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("email", event.target.value);
                      }}
                    />
                  </div>
                  <div className="form-item">
                    <InputField
                      type="date"
                      name="Day of birth"
                      placeholder="Enter day of birth"
                      value={formik.values.dayOfBirth}
                      errorMessage={
                        errors?.dayOfBirth && touched.dayOfBirth
                          ? errors?.dayOfBirth
                          : ""
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("dayOfBirth", event.target.value);
                      }}
                    />
                  </div>
                  <div className="form-item">
                    <InputField
                      type="number"
                      name="Phone"
                      placeholder="Enter number phone"
                      value={formik.values.phone}
                      errorMessage={
                        errors?.phone && touched.phone ? errors?.phone : ""
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("phone", event.target.value);
                      }}
                    />
                  </div>
                  <div className="form-item">
                    <SelectField
                      name="Department"
                      data={departments}
                      value={formik.values.department_id}
                      errorMessage={
                        errors?.department_id && touched.department_id
                          ? errors?.department_id
                          : ""
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("department_id", event.target.value);
                      }}
                    />
                  </div>
                  <div className="form-item">
                    <SelectField
                      name="Position"
                      data={positions}
                      value={formik.values.position_id}
                      errorMessage={
                        errors?.position_id && touched.position_id
                          ? errors?.position_id
                          : ""
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("position_id", event.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="form-footer">
                  <Button type="submit" label="Submit" />
                  <Button
                    action="cancel"
                    label="Cancel"
                    className="ml-2"
                    onClick={() => {
                      formik.resetForm();
                    }}
                  />
                </div>
              </Card>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default EmployeeFormCreate;
