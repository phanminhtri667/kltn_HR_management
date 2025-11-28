import { ReactNode } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import  "./DefaultLayout.scss";
import Footer from "../components/footer/Footer";
import Breadcrumb from "../components/breadcrumb/Breadcrumb";
  interface DefaultLayoutProps {
    children: ReactNode;
  }

  const DefaultLayout = ({ children }: DefaultLayoutProps) => {
    return (
        <>
            <div className="layout-container">
                <div className="sidebar">
                    <Sidebar/>
                </div>
                <div className="header">
                  <Header/>
                </div>
                <div className="content">
                  <div className="breadcrums">
                    <Breadcrumb></Breadcrumb>
                  </div>
                    {children}
                </div>
                <div className="footer">
                  <Footer/>
                </div>
            </div>
        </>
    )
  };

  export default DefaultLayout;
