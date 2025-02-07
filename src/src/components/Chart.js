import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const ZoomableChart = ({ rawData, compressionFactor }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);

    // Label
    const labels = rawData.map((_, index) => index + 1);

    // Compression Data
    const compressData = (data, factor) => {
        const compressedData = [];
        for (let i = 0; i < data.length; i += factor) {
            compressedData.push(data[i]);
        }
        return compressedData;
    };

    const compressedData = compressData(rawData, compressionFactor);

    // Chart Data
    const chartData = {
        labels: labels,
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

    // Chart Configuration
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'X Axis',
                    font: {
                        size: 16,
                    },
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
                min: 1,
                max: 10,
            },
            y: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Y Axis',
                    font: {
                        size: 16,
                    },
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true, //  Use tooltip
                bodyFont: {
                    size: 14,
                },
                titleFont: {
                    size: 16,
                },
            },
            legend: {
                labels: {
                    font: {
                        size: 16,
                    },
                },
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                    threshold: 10,
                    onPan: function ({ chart }) {
                        const { min: xMin, max: xMax } = chart.scales.x;
                        const { min: yMin, max: yMax } = chart.scales.y;

                        chart.options.scales.x.min = xMin;
                        chart.options.scales.x.max = xMax;
                        chart.options.scales.y.min = yMin;
                        chart.options.scales.y.max = yMax;
                        chart.update();
                    },
                },
                zoom: {
                    enabled: true,
                    mode: 'xy',
                    speed: 0.1,
                    threshold: 10,
                    sensitivity: 1,
                    limits: {
                        x: { min: 1, max: labels.length },
                        y: { min: 0, max: 100 },
                    },
                    wheel: {
                        enabled: true,
                        mode: 'xy',
                        speed: 0.1,
                        threshold: 10,
                        onZoom: function ({ chart, event }) {
                            const { offsetX, offsetY } = event;
                            const chartArea = chart.chartArea;

                            const xPercent = (offsetX - chartArea.left) / chartArea.width;
                            const yPercent = (offsetY - chartArea.top) / chartArea.height;

                            const zoomLevel = event.deltaY < 0 ? 1.1 : 0.9;

                            const currentZoomX = chart.options.scales.x.zoomLevel || 1;
                            const currentZoomY = chart.options.scales.y.zoomLevel || 1;

                            const newZoomX = currentZoomX * zoomLevel;
                            const newZoomY = currentZoomY * zoomLevel;

                            chart.options.scales.x.zoomLevel = newZoomX;
                            chart.options.scales.y.zoomLevel = newZoomY;

                            chart.update();
                            event.preventDefault();
                        },
                    },
                },
            },
        },
    };

    // Prevent the wheel operation on the web server
    const handleWheel = (event) => {
        if (chartContainerRef.current && chartContainerRef.current.contains(event.target)) {
            event.preventDefault();
        }
    };

    useEffect(() => {
        const container = chartContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    return (
        <div
            ref={chartContainerRef}
            style={{ width: '100%', height: '500px', overflow: 'hidden' }}
        >
            <Line
                ref={chartRef}
                data={chartData}
                options={options}
            />
        </div>
    );
};

export default ZoomableChart;