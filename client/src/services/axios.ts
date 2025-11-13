import axios, { AxiosError } from 'axios';
import store from '../redux/store';
import { showToast } from '../redux/features/toastSlice';

const baseURL =
  process.env.REACT_APP_API_URL ||
  window.location.origin + '/'; 

const AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

const setAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    AxiosInstance.defaults.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  } else {
    // Nếu không có token, xóa header Authorization
    delete AxiosInstance.defaults.headers['Authorization'];
  }
};
// Gọi setAuthHeader mỗi lần AxiosInstance được sử dụng
setAuthHeader();

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
