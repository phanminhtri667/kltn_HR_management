import {Card} from 'primereact/card';
import './login.scss';
import InputField from '../../components/forms/input/InputField';
import Button from '../../components/forms/button/Button';
import {Formik, Form} from "formik";
import {ChangeEvent, useState} from 'react';
import * as yup from 'yup';
import AxiosInstance from '../../services/axios';
import {useDispatch} from 'react-redux';
import {login} from '../../redux/features/authSlice';
import {useNavigate} from 'react-router-dom';

interface LoginModel {
    email: string,
    password: string;
}

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const [errorMessage, setErrorMessage] = useState('');
    const initialValues = {
        email: '',
        password: ''
    };
    const validationSchema = yup.object().shape({
        email: yup.string().email(' Invalid email').required(' is a required field'),
        password: yup.string().required(' is a required field'),
    });

    const handleSignin = async(values: LoginModel) => {
        const result = await AxiosInstance.post('api/auth/login',values)
        const token = result.data.access_token
        if(token){
            dispatch(login(token));
            localStorage.setItem('token', token);
            navigate('/')
        }else{
            setErrorMessage(result.data.mes)
        }
        console.log(result.data)
    };

    return (
        <div className="login">
            <Card>
                <div className="login-card">
                    <div className="login-content">
                        <div className="card-logo">
                            <img src="/static/media/icons8-logo.a946c11612681281646f5888f196edaa.svg" alt="" />
                        </div>
                        <div className="card-form">
                            <Formik initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={(values) => {
                                    handleSignin(values);
                                }}>

                                {(formik) => {
                                    const {errors, touched, setFieldValue} = formik;
                                    return (
                                        <Form>
                                            <div className="form-item">
                                                <div className='form-title'>LOGIN TO YOUR ACCOUNT</div>
                                                <div className='mb-3'>
                                                    <InputField
                                                        className='fomr-input'
                                                        autocomplete="off"
                                                        type="text"
                                                        name="email"
                                                        placeholder='Enter email'
                                                        value={formik.values.email}
                                                        errorMessage={errors?.email && touched.email ? errors?.email : ''}
                                                        onChange={
                                                            (event: ChangeEvent<HTMLInputElement>) => {
                                                                setFieldValue("email", event.target.value);
                                                                setErrorMessage('')
                                                            }
                                                        }
                                                    />
                                                </div>
                                                <div className='mb-3'>
                                                    <InputField
                                                        className='fomr-input'
                                                        type="password"
                                                        name="password"
                                                        placeholder='Enter password'
                                                        value={formik.values.password}
                                                        errorMessage={errors?.password && touched.password ? errors?.password : ''}
                                                        onChange={
                                                            (event: ChangeEvent<HTMLInputElement>) => {
                                                                setFieldValue("password", event.target.value);
                                                                setErrorMessage('')
                                                            }
                                                        }
                                                    />
                                                </div>
                                                {errorMessage && <p className='text-error'>{errorMessage}</p>}

                                            </div>
                                            <div className="form-footer">
                                                <Button className='btn-login' type='submit' label="Submit" />
                                            </div>
                                        </Form>
                                    );
                                }
                                }</Formik>

                        </div>
                        <div className="flex-center">Don't have account yet? <a href="/signup" className='signup ml-2'>Sign Up</a></div>
                    </div>
                </div>
            </Card>


        </div>
    );
};
export default Login;