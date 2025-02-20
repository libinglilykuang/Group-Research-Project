import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

const ZoomableChart = ({ rawData, labels, compressionFactor }) => {
    if (!rawData.length || !labels.length) {
        return <p style={{ textAlign: 'center', fontSize: '18px', color: 'gray' }}>Please upload CSV data</p>;
    }

    // 压缩数据
    const compressData = (data, factor) => data.filter((_, index) => index % factor === 0);

    const compressedData = compressData(rawData, compressionFactor);
    const compressedLabels = compressData(labels, compressionFactor);

    const chartData = {
        labels: compressedLabels, // X 轴（时间）
        datasets: [
            {
                label: 'Raw Data',
                data: rawData,
                borderColor: '#8884d8',
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'Compressed Data',
                data: compressedData,
                borderColor: '#82ca9d',
                borderWidth: 2,
                fill: false,
                pointRadius: 5,
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