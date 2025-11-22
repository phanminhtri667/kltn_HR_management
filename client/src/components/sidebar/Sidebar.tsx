import "./Sidebar.scss";
import logo from "../../assets/images/icons8-logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faCalendarDays,
    faEllipsis,
    faArrowRight,
    faSun,
    faUserGear,
    faGear,
    faBarsStaggered,
} from "@fortawesome/free-solid-svg-icons";
import {
    faComment,
    faAddressCard,
    faFolder,
    faHardDrive,
    faCopyright,
    faChartBar,
    faRectangleList,
    faClone,
    faMap,
    faImage,
} from "@fortawesome/free-regular-svg-icons";
import { faAlgolia } from "@fortawesome/free-brands-svg-icons";
import { Link, useLocation } from "react-router-dom";

//them
import { useSelector } from "react-redux";

const menus = [
    { id: 1, name: "Dashboard", path: "/" },
    { id: 2, name: "Department", path: "/department" },
    { id: 3, name: "Employee", path: "/employee" },
    { id: 4, name: "Timekeeping", path: "/timekeeping" },
    { id: 5, name: "Payroll", path: "/payroll" },
    { id: 6, name: "Contracts", path: "/contracts" },
    
];
const Sidebar = () => {
    // const
    const userRole = useSelector((state: any) => state.auth.user?.role_code);
    console.log("ROLE CODE:", userRole);  // 👈 kiểm tra đã lấy được chưa

    const location = useLocation();

    return (
        <>
            <div className="sidebar-container">
                <div className="sidebar-sub">
                    <div className="logo">
                        <img src={logo} alt="logo" />
                    </div>

                    <div className="list-icon">
                        <div className="list-icon-item pointer">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </div>
                        <div className="list-icon-item pointer">
                            <FontAwesomeIcon icon={faCalendarDays} />
                        </div>
                        <div className="list-icon-item pointer">
                            <FontAwesomeIcon icon={faAddressCard} />
                        </div>
                        <div className="list-icon-item pointer">
                            <FontAwesomeIcon icon={faComment} flip="horizontal" />
                        </div>
                        <div className="list-icon-item pointer">
                            <FontAwesomeIcon icon={faFolder} />
                        </div>
                    </div>

                    <div className="sidebar-sub-config">
                        <div className="list-icon-item spin pointer">
                            <FontAwesomeIcon icon={faGear} />
                        </div>
                        <div className="list-icon-item pointer">
                            <FontAwesomeIcon icon={faUserGear} />
                        </div>
                    </div>
                    <div className="sidebar-sub-toggle">
                        <div className="list-icon-item pointer">
                            <FontAwesomeIcon icon={faBarsStaggered} />
                        </div>
                    </div>
                </div>

                <div className="sidebar-menu">
                    <div className="logo pointer">
                        <span>Epic HR</span>
                    </div>
                    <div className="menu">
                        <p>DIRECTORIES</p>
                        <span>HRMS</span>
                        {menus.map((item, index) => {
                            let isVisible = false;

                            if (userRole === "role_1") {
                              isVisible = true; // admin thấy tất cả
                            } else if (userRole === "role_2") {
                              isVisible = item.name !== "Department"; // leader không thấy Department
                            } else if (userRole === "role_3") {
                              isVisible = !["Department", "Employee"].includes(item.name); // member không thấy cả hai
                            }
                          
                            if (!isVisible) return null;
                          
                            return (
                              <Link
                                key={index}
                                to={item.path}
                                className={`menu-item pointer ${item.path === location.pathname ? "menu-active" : ""}`}
                              >
                                <p>
                                  <FontAwesomeIcon
                                    icon={item.path === location.pathname ? faArrowRight : faEllipsis}
                                    className="menu-item-icon"
                                  />
                                  {item.name}
                                </p>
                              </Link>
                            );
                        })}
                    </div>
                    <div className="menu-plus">
                        <div className="menu-plus-wrap">
                            <span>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon
                                        icon={faAlgolia}
                                        className="menu-item-icon"
                                    />
                                    Project
                                </p>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon
                                        icon={faHardDrive}
                                        className="menu-item-icon"
                                    />
                                    Job Portal
                                </p>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon icon={faSun} className="menu-item-icon" />
                                    Authentication
                                </p>
                            </span>
                        </div>
                        <div className="menu-plus-wrap">
                            <p className="menu-plus-heading">UI ELEMENT</p>
                            <span>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon
                                        icon={faCopyright}
                                        className="menu-item-icon"
                                    />
                                    Icon
                                </p>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon
                                        icon={faChartBar}
                                        rotation={270}
                                        className="menu-item-icon"
                                    />
                                    Chart
                                </p>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon
                                        icon={faRectangleList}
                                        rotation={270}
                                        className="menu-item-icon"
                                    />
                                    Forms
                                </p>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon icon={faClone} className="menu-item-icon" />
                                    Table
                                </p>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon icon={faMap} className="menu-item-icon" />
                                    Map
                                </p>
                                <p className="menu-item pointer ">
                                    <FontAwesomeIcon icon={faImage} className="menu-item-icon" />
                                    Gallery
                                </p>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
