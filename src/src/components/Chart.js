import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

const ZoomableChart = ({ rawData, labels, compressedData, compressedLabels }) => {
    // 如果没有数据，显示一个空的图表框架
    const isEmpty = !rawData.length || !labels.length;

    const chartData = {
        labels: isEmpty ? [] : labels, // 如果没有数据，使用空数组
        datasets: [
            {
                label: 'Raw Data',
                data: isEmpty ? [] : rawData.map((value, index) => ({ x: labels[index], y: value })), // 如果没有数据，使用空数组
                borderColor: '#82ca9d',
                borderWidth: 2,
                fill: false,
                pointRadius: 2, // 较小的点半径
            },
            {
                label: 'Compressed Data',
                data: isEmpty ? [] : compressedData.map((value, index) => ({ x: compressedLabels[index], y: value })), // 如果没有数据，使用空数组
                borderColor: '#8884d8',
                borderWidth: 2,
                fill: false,
                pointRadius: 5, // 较大的点半径
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category', // 使用分类轴
                title: { display: true, text: 'Time', font: { size: 16 } },
                ticks: {
                    autoSkip: true, // 自动跳过密集的标签
                    maxTicksLimit: 10, // 最多显示 10 个标签
                    font: { size: 14 },
                },
            },
            y: {
                title: { display: true, text: 'Value', font: { size: 16 } },
                ticks: { font: { size: 14 } },
            },
        },
        plugins: {
            zoom: {
                pan: { enabled: true, mode: 'xy' },
                zoom: { enabled: true, mode: 'xy', wheel: { enabled: true } },
            },
            // 如果没有数据，显示提示信息
            title: {
                display: isEmpty,
                text: 'Please upload CSV data to display the chart',
                font: { size: 18 },
                color: 'gray',
                padding: 20,
            },
        },
    };

    return (
        <div style={{ width: '100%', height: '500px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default ZoomableChart;