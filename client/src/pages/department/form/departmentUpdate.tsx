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

const DepartmentFormUpdate = ({ ...props }) => {
  const { data, closeModal } = props;
  const toast = useRef<Toast | null>(null);

  const initialValues = {
    value: data.value,
    code: data.code,
  };

  const validationSchema = yup.object().shape({
    value: yup.string().required(" is a required field"),
  });

  const handleUpdateDepartment = async (values: any) => {
    console.log(values);

    // try {
    //   const response = await axios.post(apiUrl.employee.index, values);
    //   if (response) {
    //     if (toast.current) {
    //       toast.current.show({
    //         severity: "success",
    //         summary: "Confirmed",
    //         detail: "Create successfully",
    //         life: 1500,
    //       });
    //     }
    //   }
    // } catch (error) {
    //   if (toast.current) {
    //     toast.current.show({
    //       severity: "error",
    //       summary: "Confirmed",
    //       detail: "Create error",
    //       life: 1500,
    //     });
    //   }
    // }
  };

  if (!data) return null;

  return (
    <div>
      <Toast ref={toast} />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleUpdateDepartment(values);
        }}>
        {(formik) => {
          const { errors, touched, setFieldValue } = formik;
          return (
            <Form>
              <div className="form">
                <div className="form-item">
                  <InputField
                    type="text"
                    name="Department"
                    placeholder="Enter department"
                    value={formik.values.value}
                    errorMessage={
                      errors?.value && touched.value ? errors?.value : ""
                    }
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setFieldValue("value", event.target.value);
                    }}
                  />
                </div>
                <div className="form-item">
                  <InputField
                    type="text"
                    name="Code"
                    placeholder="Enter code"
                    readOnly={true}
                    value={formik.values.code}
                    errorMessage={
                      errors?.code && touched.code ? errors?.code : ""
                    }
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setFieldValue("email", event.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="form-footer float-right">
                <Button type="submit" label="Submit" />
                <Button
                  action="cancel"
                  label="Cancel"
                  className="ml-2"
                  onClick={() => {
                    closeModal();
                  }}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default DepartmentFormUpdate;
