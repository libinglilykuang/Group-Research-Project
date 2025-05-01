import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

const ZoomableChart = ({ rawData = [], labels = [], compressedData = [], compressedLabels = [] }) => {
    const isEmpty = !rawData?.length || !labels?.length;

    const chartData = {
        labels: isEmpty ? [] : labels,
        datasets: [
            {
                label: 'Compressed Data',
                data: !compressedData?.length || !compressedLabels?.length ? [] :
                    compressedData.map((value, index) => ({ x: compressedLabels[index], y: value })),
                borderColor: '#8884d8',
                borderWidth: 2,
                fill: false,
                pointRadius: 5,
                spanGaps: false,
            },
            {
                label: 'Raw Data',
                data: isEmpty ? [] : rawData.map((value, index) => ({ x: labels[index], y: value })),
                borderColor: '#82ca9d',
                borderWidth: 2,
                fill: false,
                pointRadius: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Time',
                    font: { size: 14 },
                    padding: { top: 10, bottom: 10 }
                },
                grid: { display: false },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                    font: { size: 12 },
                },
                bounds: 'ticks'
            },
            y: {
                title: {
                    display: true,
                    text: 'Value',
                    font: { size: 14 },
                    padding: { top: 10, bottom: 10 }
                },
                ticks: { font: { size: 12 } },
                grid: { color: '#f0f0f0' }
            },
        },
        plugins: {
            zoom: {
                pan: { enabled: true, mode: 'xy' },
                zoom: { enabled: true, mode: 'xy', wheel: { enabled: true } }
            },
            legend: {
                position: 'top',
                labels: { padding: 20 }
            }
        },
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '500px',
            padding: '0px 20px',
            boxSizing: 'border-box',
            margin: '0px auto',
            maxWidth: 'calc(100% - 40px)'
        }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default ZoomableChart;
