
import  { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';

const DoughnutChart = () =>  {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {

        const data = {
            labels: ['A', 'B', 'C'],
            datasets: [
                {
                    data: [300, 50, 100],
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
        };
        const options = {
            cutout: '60%'
        };

        setChartData(data);
        setChartOptions(options);
    }, []);

    return (
        <div className="card flex justify-content-center">
            <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full md:w-30rem" />
        </div>
    )
}
       
export default DoughnutChart