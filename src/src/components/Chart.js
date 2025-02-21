import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

const ZoomableChart = ({ rawData, labels, compressedData, compressedLabels }) => {
    if (!rawData.length || !labels.length) {
        return <p style={{ textAlign: 'center', fontSize: '18px', color: 'gray' }}>Please upload CSV data</p>;
    }

    const chartData = {
        labels: labels, // X 轴使用原始数据的横坐标
        datasets: [
            {
                label: 'Raw Data',
                data: rawData.map((value, index) => ({ x: labels[index], y: value })), // 原始数据
                borderColor: '#82ca9d',
                borderWidth: 2,
                fill: false,
                pointRadius: 2, // 较小的点半径
            },
            {
                label: 'Compressed Data',
                data: compressedData.map((value, index) => ({ x: compressedLabels[index], y: value })), // 压缩数据
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
        },
    };

    return (
        <div style={{ width: '100%', height: '500px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default ZoomableChart;