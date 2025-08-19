import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";

const PieChart = () => {
    const [pieChartData, setPieChartData] = useState({});
    const [pieChartOptions, setPieChartOptions] = useState({});
    useEffect(() => {
        const dataPieChart = {
            labels: ['A', 'B', 'C'],
            datasets: [
                {
                    data: [540, 325, 702],
                    backgroundColor: [
                        '#474262',
                        '#6f6593', 
                        '#8075aa'
                    ],
                    hoverBackgroundColor: [
                        '#474262',
                        '#6f6593', 
                        '#8075aa'
                    ]
                }
            ]
        }
        const optionsPieChart = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true
                    }
                }
            }
        };

        setPieChartData(dataPieChart);
        setPieChartOptions(optionsPieChart);
    }, [])
    
    return (
        <>
            <Chart type="pie" data={pieChartData} options={pieChartOptions} className="w-full md:w-30rem" />
        </>
    )
}

export default PieChart