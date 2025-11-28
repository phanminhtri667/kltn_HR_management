
import DefaultLayout from "../../layouts/DefaultLayout";
import "./DashBoard.scss";
import { Card } from "primereact/card";
import BarChart from "../../components/Charts/BarChart";
import PieChart from "../../components/Charts/PieChart";
import LineChart from "../../components/Charts/LineChart";
import BarChartBasic from "../../components/Charts/BarChartBasic";
import DoughnutChart from "../../components/Charts/DoughnutChart";
import RadarChart from "../../components/Charts/RadarChart";
import DashBoardTable from "./table/DashBoardTable";

const DashBoard = () => {

    return (
        <>
            <DefaultLayout>
                <span className="heading">Welcome Jason Porter!</span>
                <br />
                <br />
                <span className="heading-sub">
                    Measure How Fast You’re Growing Monthly Recurring Revenue.
                </span>
                <div className="dashboard">
                    <div className="dashboard-menu">
                        <Card className="pointer">
                            <div className="card-item">
                                <i className="pi pi-users fs-2xl"></i>
                                <span className='card-content'>User</span>
                            </div>
                        </Card>
                        <Card className="pointer">
                            <div className="card-item">
                                <i className="pi pi-chevron-circle-up fs-2xl"></i>
                                <span className='card-content'>Holidays</span>
                            </div>
                        </Card>
                        <Card className="pointer">
                            <div className="card-item">
                                <i className="pi pi-calendar-times fs-2xl"></i>
                                <span className='card-content'>Events</span>
                            </div>
                        </Card>
                        <Card className="pointer">
                            <div className="card-item">
                                <i className="pi pi-credit-card fs-2xl"></i>
                                <span className='card-content'>Payroll</span>
                            </div>
                        </Card>
                        <Card className="pointer">
                            <div className="card-item">
                                <i className="pi pi-id-card fs-2xl"></i>
                                <span className='card-content'>Accounts</span>
                            </div>
                        </Card>
                        <Card className="pointer">
                            <div className="card-item">
                                <i className="pi pi-ban fs-2xl"></i>
                                <span className='card-content'>Report</span>
                            </div>
                        </Card>
                    </div>
                    <div className="chart">
                        <Card className="chart-salary">
                            <p>SALARY STATISTICS</p>
                            <BarChart />
                        </Card>
                        <Card className="chart-revenue">
                            <p>REVENUE</p>
                            <PieChart />
                        </Card>
                        <Card className="chart-balance">
                            <p>MY BALANCE</p>
                            <LineChart />
                        </Card>
                        <Card className="chart-structure">
                            <p>EMPLOYEE STRUCTURE</p>
                            <BarChartBasic />
                        </Card>
                        <Card className="chart-performance">
                            <p>PERFORMANCE</p>
                            <RadarChart />
                        </Card>
                        <Card className="chart-growth">
                            <p>GROWTH</p>
                            <DoughnutChart />
                        </Card>
                    </div>
                </div>
                <div className="project">
                    <Card>
                        <DashBoardTable />
                    </Card>
                </div>
            </DefaultLayout>
        </>
    );
};

export default DashBoard;
