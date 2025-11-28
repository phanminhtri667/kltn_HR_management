import { faBell, faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import InputField from "../forms/input/InputField";
import "./Header.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card } from "primereact/card";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/authSlice";
import io from "socket.io-client";
import AxiosInstance from "../../services/axios";
import apiUrl from "../../constant/apiUrl";

const Header = () => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [dataNotifiCation, setDataNotification] = useState<
    Record<string, any>[]
  >([]);
  const dispatch = useDispatch();
  console.log("dataNotifiCation", dataNotifiCation);

  useEffect(() => {
    getNotification();
    const socket = io("http://localhost:3000", {
  transports: ["websocket"],   // ép dùng websocket, không fallback về polling
  withCredentials: true,
});
    socket.on("employee_created", (data) => {
      console.log("employee_created", data);
      if (data) {
        getNotification();
        setShowNotification(true);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const getNotification = async () => {
    const result = await AxiosInstance.get(apiUrl.notification.index);
    if (result.data) {
      console.log(result.data.data);
      setDataNotification(result.data.data);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    dispatch(logout());
  };

  const handleNotificationClick = () => {
    setShowNotification(false);
  };

  return (
    <>
      <div className="header-container">
        <div className="header-title">
          <span className="title">HR Dashboard</span>
          <div className="header-search">
            <InputField className="font-size" placeholder="Search..." />
          </div>
        </div>
        <div className="header-menu">
          <div className="header-menu-config">
            <ul>
              <li className="pointer">Language</li>
              <li className="pointer">Reports</li>
              <li className="pointer">Project</li>
            </ul>
          </div>
          <div className="header-menu-icon">
            <div className="header-menu-icon-item pointer">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <div className="header-menu-icon-item pointer">
              <div className="bell-wrap">
                <FontAwesomeIcon
                  icon={faBell}
                  onClick={() => {
                    setIsOpenNotification(true);
                    setIsOpenDropdown(false);
                    setShowNotification(false);
                  }}
                />
                {showNotification && (
                  <div className="header-menu-icon-bell-notification"></div>
                )}
              </div>
            </div>
            <div className="header-menu-icon-item pointer user">
              <FontAwesomeIcon
                icon={faUser}
                onClick={() => {
                  setIsOpenNotification(false);
                  setIsOpenDropdown(true);
                }}
              />
              {isOpenDropdown && (
                <div
                  className="dropdown z-999"
                  onMouseLeave={() => setIsOpenDropdown(false)}>
                  <Card>
                    <div className="dropdown-content pt-2 pb-2">
                      <div className="item pointer ml-2 mr-2 pt-2 pb-2">
                        <i className="pi pi-user mr-2 pt-2 pb-2"></i>
                        <span>Profile</span>
                      </div>
                      <div className="item pointer ml-2 mr-2 pt-2 pb-2">
                        <i className="pi pi-cog mr-2 pt-2 pb-2"></i>
                        <span>Settings</span>
                      </div>
                      <div className="item pointer ml-2 mr-2 pt-2 pb-2">
                        <i className="pi pi-envelope mr-2 pt-2 pb-2"></i>
                        <span>Inbox</span>
                      </div>
                      <div className="item pointer ml-2 mr-2 pt-2 pb-2">
                        <i className="pi pi-check-square mr-2 pt-2 pb-2"></i>
                        <span>Role</span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <div className="item pointer ml-2 mr-2 pt-2 pb-2">
                        <i className="pi pi-question-circle mr-2 pt-2 pb-2"></i>
                        <span>Need help</span>
                      </div>
                      <div
                        className="item pointer ml-2 mr-2 pt-2 pb-2"
                        onClick={() => handleSignOut()}>
                        <i className="pi pi-sign-out mr-2 pt-2 pb-2"></i>
                        <span>Sign out</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
              {isOpenNotification && (
                <div
                  className="dropdown z-999"
                  onMouseLeave={() => setIsOpenNotification(false)}>
                  <Card>
                    <div className="notification-content pt-2 pb-2">
                      {dataNotifiCation.length == 0 ? (
                        <div className="notification-content-item">
                          <p>Không có thông báo</p>
                        </div>
                      ) : (
                        <div>
                          {dataNotifiCation.map((item, index) => (
                            <span key={index} className="notification-content-item">
                              {item["message"]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
