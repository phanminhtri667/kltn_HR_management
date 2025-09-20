import './App.scss'
import { BrowserRouter as Router,  useNavigate,  useRoutes} from "react-router-dom";
import DashBoard from  './pages/dashBoard/DashBoard'
import Employee from "./pages/employee/employee";
import Department from "./pages/department/department";
import EmployeeDetail from "./pages/employee/detail/EmployeeDetail";
import Login from "./pages/login/login";
// thêm 
import TimekeepingPage from "./pages/timekeeping/index";
import LeavePage from "./pages/leave/index";
import PrivateRoute from "./components/PrivateRoute"; 
import ApproveLeave from "./pages/approve-leave/ApproveLeave";

import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {checkToken} from "./redux/features/authSlice";
import Emty from "./pages/emty/emty";
import {setDepartment} from './redux/features/departmentSlice';
import axios from './services/axios';
import apiUrl from './constant/apiUrl';
import {setPosition} from './redux/features/positionSlice';
import Timekeeping from "./pages/timekeeping/Timekeeping";
import Payroll from "./pages/payroll/payroll";  // ✅ Thêm route cho Payroll

const AppRoutes = () => {
  const navigate= useNavigate()
  const isAuthenticated = useSelector((state:any) => state.auth.isAuthenticated);

  const routes = useRoutes(
    [
      { path: "/", element: <PrivateRoute allowedRoles={['role_1', 'role_2', 'role_3']}><DashBoard /></PrivateRoute> },

      { path: "/login", element: <Login/>  },
      { path: "/employee", element: (<PrivateRoute allowedRoles={['role_1', 'role_2', 'role_3']}><Employee /></PrivateRoute>) },
      { 
        path: "/employee/:employeeId", 
        element: (
          <PrivateRoute allowedRoles={['role_1', 'role_2', 'role_3']}>
            <EmployeeDetail />
          </PrivateRoute>
        ) 
      },
      { 
        path: "/department", 
        element: (
          <PrivateRoute allowedRoles={['role_1', 'role_2', 'role_3']}>
            <Department />
          </PrivateRoute>
        ) 
      },
      { 
        path: "/timekeeping", 
        element: (
          <PrivateRoute allowedRoles={['role_1', 'role_2', 'role_3']}>
            <Timekeeping />
          </PrivateRoute>
        ) 
      },
      { path: "/payroll", element: <Payroll /> },
      { path: "/test", element: <Emty/> },
      { path: "/test1", element: <Emty/> },
      { path: "/test2", element: <Emty/> },
      { path: "/test3", element: <Emty/> },
      { path: "/test4", element: <Emty/> },
      { path: "/test5", element: <Emty/> },
      { path: "/test6", element: <Emty/> },
    ]
  )

  return routes;
}

const App = () => {

  const dispatch = useDispatch();

    useEffect(() => {
    dispatch(checkToken());
    getDepartment()
    getPosition()
  }, [dispatch]);

  const getDepartment = async () => {
    try {
      const response = await axios.get(apiUrl.department.index);
      const data = response.data.data;
      console.log('data department', data, response.data);
      dispatch(setDepartment(data));
    } catch (error) {
      console.log(error);
    }
  };
  
  const getPosition = async () => {
    try {
      const response = await axios.get(apiUrl.position.index);
      const data = response.data.data;
      console.log('data position', data, response.data);
      dispatch(setPosition(data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Router>
        <AppRoutes/>
      </Router>
    </>
  );
}

export default App;
