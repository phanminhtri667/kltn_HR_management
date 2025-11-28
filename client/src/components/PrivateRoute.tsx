import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, allowedRoles }: any) => {
  const userRole = useSelector((state: any) => state.auth.user?.role_code);

  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!userRole) {
    return <Navigate to="/login" />;
  }

  // Nếu người dùng không có quyền truy cập vào trang này, chuyển hướng về trang chủ
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
