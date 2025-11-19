import axios, { AxiosError } from 'axios';
import store from '../redux/store';
import { showToast } from '../redux/features/toastSlice';

const isProd = process.env.NODE_ENV === 'production';

const baseURL = isProd
  ? '/api'  
  : (process.env.REACT_APP_API_URL || 'http://localhost:3000');

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
    
    delete AxiosInstance.defaults.headers['Authorization'];
  }
};
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
