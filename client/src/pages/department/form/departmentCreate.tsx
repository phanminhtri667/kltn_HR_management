import { Form, Formik } from 'formik';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { ChangeEvent, useRef } from 'react';
import * as yup from 'yup';
import Button from '../../../components/forms/button/Button';
import InputField from '../../../components/forms/input/InputField';
import apiUrl from '../../../constant/apiUrl';
import axios from '../../../services/axios';

let initialValues = {
  code: '',
  value: '',
};
const DepartmentFormCreate = () => {
  const toast = useRef<Toast | null>(null);

  const validationSchema = yup.object().shape({
    code: yup.string().required(' is a required field'),
    value: yup.string().required(' is a required field'),
  });

  const handleAddDepartment = async (values: any, formik: any) => {
    try {
      const response = await axios.post(apiUrl.department.index, values);
      if (response) {
        if (toast.current) {
          toast.current.show({
            severity: 'success',
            summary: 'Confirmed',
            detail: 'Create successfully',
            life: 1500,
          });
        }
      }
      formik.resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Create error';
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
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
          handleAddDepartment(values, formik);
        }}
      >
        {formik => {
          const { errors, touched, setFieldValue } = formik;
          return (
            <Form>
              <Card>
                <div className="form">
                  <div className="form-item">
                    <InputField
                      type="text"
                      name="Department code"
                      placeholder="Enter department code"
                      value={formik.values.code}
                      errorMessage={
                        errors?.code && touched.code ? errors?.code : ''
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('code', event.target.value);
                      }}
                    />
                  </div>
                  <div></div>
                  <div className="form-item">
                    <InputField
                      type="text"
                      name="Department name"
                      placeholder="Enter department name"
                      value={formik.values.value}
                      errorMessage={
                        errors?.value && touched.value ? errors?.value : ''
                      }
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('value', event.target.value);
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

export default DepartmentFormCreate;
