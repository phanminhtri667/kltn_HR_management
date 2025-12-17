import axios, { AxiosError } from "axios";
import store from "../redux/store";
import { showToast } from "../redux/features/toastSlice";

const baseURL = process.env.REACT_APP_API_URL;

const AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

/**
 * ======================================
 * 2. SET AUTH HEADER (GỌI LẠI KHI LOGIN)
 * ======================================
 */
export const refreshAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (token) {
    AxiosInstance.defaults.headers["Authorization"] =
      token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  } else {
    delete AxiosInstance.defaults.headers["Authorization"];
  }
};

// chạy 1 lần khi load trang
refreshAuthHeader();

/**
 * ==========================
 * 3. HANDLE ERROR
 * ==========================
 */

const handleBadRequest = (error: AxiosError) => {
  const errMessage =
    error.response?.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
      ? (error.response.data as { message: string }).message
      : "Bad Request";

  store.dispatch(
    showToast({
      severity: "error",
      summary: "Error",
      detail: errMessage,
      life: 1500,
    })
  );
};

const handleServerError = (error: AxiosError) => {
  console.log("Server error:", error);
};

/**
 * ==============================
 * 4. RESPONSE INTERCEPTOR
 * ==============================
 */
AxiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 400) handleBadRequest(error);
    else if (status && status > 400) handleServerError(error);

    return Promise.reject(error);
  }
);

export default AxiosInstance;
