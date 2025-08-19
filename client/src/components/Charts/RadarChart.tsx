
import  { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
const RadarChart = () => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const data = {
            labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
            datasets: [
                {
                    label: 'My First dataset',
                    borderColor: '#474262',
                    pointBackgroundColor: '#474262',
                    pointBorderColor: '#474262',
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: '#474262',
                    data: [65, 59, 90, 81, 56, 55, 40]
                },
                {
                    label: 'My Second dataset',
                    borderColor: '#a192d9',
                    pointBackgroundColor: '#a192d9',
                    pointBorderColor: '#a192d9',
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: '#a192d9',
                    data: [28, 48, 40, 19, 96, 27, 100]
                }
            ]
        };
        const options = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                r: {
                    grid: {
                        color: textColorSecondary
                    }
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    }, []);

    return (
        <div className="card flex justify-content-center">
            <Chart type="radar" data={chartData} options={chartOptions} className="w-full md:w-30rem" />
        </div>
    )
}
        
export default RadarChart