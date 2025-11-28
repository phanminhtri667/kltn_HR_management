import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";

const BarChartBasic = () => {
    const [ barChartData, setBarChartData ] = useState({});
    const [ barChartOptions, setBarChartOptions ] = useState({});

    useEffect(() => {
        const dataBarChart = {
            labels: [ "January", "February", "March", "April", "May", "June", "July" ],
            datasets: [
         
                {
                    type: "bar",
                    label: "Dataset 2",
                    backgroundColor: "#6f6593",
                    data: [ 21, 84, 24, 75, 37, 65, 34 ],
                },
                {
                    type: "bar",
                    label: "Dataset 1",
                    backgroundColor: "#474262",
                    data: [ 50, 25, 12, 48, 90, 76, 42 ],
                },
                {
                    type: "bar",
                    label: "Dataset 3",
                    backgroundColor: "#8075aa",
                    data: [ 41, 52, 24, 74, 23, 21, 32 ],
                },
            ],
        };
        const optionsBarchart = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                tooltips: {
                    mode: "index",
                    intersect: false,
                },
                legend: {
                    labels: {
                        color: "",
                    },
                },
            },
            scales: {
                x: {
                    stacked: false,
                  
                },
                y: {
                    stacked: false,
                  
                },
            },
        };

        setBarChartData(dataBarChart);
        setBarChartOptions(optionsBarchart);
    }, []);

    return (
        <>
            <Chart type="bar" data={barChartData} options={barChartOptions} />
        </>
    );
};

export default BarChartBasic;
