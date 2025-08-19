import axios, { AxiosError } from 'axios';
import store from '../redux/store';
import { showToast } from '../redux/features/toastSlice';

const AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

const token = localStorage.getItem('token');

if (token) {
  AxiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
}

const handleBadRequest = (error: AxiosError) => {
  const errorMessage =
    error.response?.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
      ? (error.response.data as { message: string }).message
      : 'Bad Request';
  console.log('errorMessage', errorMessage, error);

  store.dispatch(
    showToast({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 1500,
    })
  );
};

const handleServerError = (error: AxiosError) => {
  console.log(error);
};

AxiosInstance.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;

    if (status === 400) {
      handleBadRequest(error);
    } else if (status && status > 400) {
      handleServerError(error);
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;
