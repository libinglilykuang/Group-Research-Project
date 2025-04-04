import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js components and plugins
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

const ZoomableChart = ({ rawData, labels, compressedData, compressedLabels }) => {
    // Check if data is empty
    const isEmpty = !rawData.length || !labels.length;

    // Define chart data
    const chartData = {
        labels: isEmpty ? [] : labels, // Use empty array if no data
        datasets: [
            {
                label: 'Raw Data',
                data: isEmpty ? [] : rawData.map((value, index) => ({ x: labels[index], y: value })), // Use empty array if no data
                borderColor: '#82ca9d',
                borderWidth: 2,
                fill: false,
                pointRadius: 2, // Smaller point radius
            },
            {
                label: 'Compressed Data',
                data: isEmpty ? [] : compressedData.map((value, index) => ({ x: compressedLabels[index], y: value })), // Use empty array if no data
                borderColor: '#8884d8',
                borderWidth: 2,
                fill: false,
                pointRadius: 5, // Larger point radius
            },
        ],
    };

    // Define chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category', // Use category axis
                title: { display: true, text: 'Time', font: { size: 16 } },
                ticks: {
                    autoSkip: true, // Automatically skip dense labels
                    maxTicksLimit: 10, // Display a maximum of 10 labels
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
                pan: { enabled: true, mode: 'xy' }, // Enable panning
                zoom: { enabled: true, mode: 'xy', wheel: { enabled: true } }, // Enable zooming with mouse wheel
            },
            // Display a message if no data is available
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
