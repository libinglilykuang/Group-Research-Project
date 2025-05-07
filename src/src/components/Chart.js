import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

// Register required chart components and plugins
ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const ZoomableChart = ({ rawData = [], labels = [], compressedData = [], compressedLabels = [] }) => {
    const chartRef = useRef(null);

    const rawPoints = useMemo(() => rawData.map((value, index) => {
        const date = new Date(labels[index]);
        return isNaN(date) ? null : { x: date.getTime(), y: value };
    }).filter(Boolean), [rawData, labels]);

    const compressedPoints = useMemo(() => compressedData.map((value, index) => {
        const date = new Date(compressedLabels[index]);
        return isNaN(date) ? null : { x: date.getTime(), y: value };
    }).filter(Boolean), [compressedData, compressedLabels]);

    const timeBounds = useMemo(() => {
        const allPoints = compressedPoints.length > 0 ? compressedPoints : rawPoints;
        if (allPoints.length === 0) return {};
        const active = allPoints.filter(p => p.x !== undefined);
        const middle = active.filter(p =>
            p.x > new Date('2023-01-01T01:00:00Z').getTime() &&
            p.x < new Date('2023-01-30T00:00:00Z').getTime()
        );
        if (middle.length > 0) {
            return {
                min: Math.min(...middle.map(p => p.x)),
                max: Math.max(...middle.map(p => p.x))
            };
        }
        const times = active.map(p => p.x);
        return {
            min: Math.min(...times),
            max: Math.max(...times)
        };
    }, [compressedPoints, rawPoints]);


    const chartData = {
        datasets: [
            {
                label: 'Compressed Data',
                data: compressedPoints,
                borderColor: '#8884d8',
                borderWidth: 2,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 5,
                spanGaps: false
            },
            {
                label: 'Raw Data',
                data: rawPoints,
                borderColor: '#82ca9d',
                borderWidth: 1,
                fill: false,
                pointRadius: 2,
                pointHoverRadius: 3
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: {
                type: 'time',
                min: timeBounds.min,
                max: timeBounds.max,
                time: {
                    tooltipFormat: 'yyyy-MM-dd HH:mm',
                    displayFormats: {
                        millisecond: 'MM-dd HH:mm:ss.SSS',
                        second: 'MM-dd HH:mm:ss',
                        minute: 'MM-dd HH:mm',
                        hour: 'MM-dd HH:mm',
                        day: 'MM-dd',
                        month: 'MMM yyyy',
                        year: 'yyyy'
                    }
                },
                title: {
                    display: true,
                    text: 'Time',
                    font: { size: 14 },
                    padding: { top: 10, bottom: 10 }
                },
                ticks: {
                    source: 'auto',
                    font: { size: 12 },
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: { display: false }
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
            }
        },
        plugins: {
            zoom: {
                pan: { enabled: true, mode: 'xy' ,speed: 5},
                zoom: {
                    enabled: true,
                    mode: 'xy',
                    wheel: { enabled: true },
                    pinch: { enabled: true }
                }
            },
            legend: {
                position: 'top',
                labels: { padding: 20 }
            }
        },
        layout: {
            padding: { left: 20, right: 20, top: 0, bottom: 0 }
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            padding: '0px 20px',
            boxSizing: 'border-box',
            margin: '0px auto',
            maxWidth: 'calc(100% - 40px)'
        }}>
            <Line ref={chartRef} data={chartData} options={options} />
        </div>
    );
};

export default ZoomableChart;
