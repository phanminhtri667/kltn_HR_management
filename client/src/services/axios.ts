import axios, { AxiosError } from "axios";
import store from "../redux/store";
import { showToast } from "../redux/features/toastSlice";

/**
 * =============================
 * BASE URL
 * =============================
 * Nếu ENV không load → fallback về 4001
 */

const baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:4001/api";
console.log("ENV LOADED:", process.env.REACT_APP_API_URL);

const AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * ======================================
 * AUTH HEADER
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

refreshAuthHeader();

/**
 * =============================
 * RESPONSE INTERCEPTOR
 * =============================
 */

AxiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 400) {
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
    } else if (status && status > 400) {
      console.error("Server error:", error);
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;
