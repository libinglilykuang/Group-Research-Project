import React, { useRef, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register required chart components and plugins
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

const ZoomableChart = ({ rawData = [], labels = [], compressedData = [], compressedLabels = [] }) => {
    const chartRef = useRef(null);

    // Cache the previous allowed min/max range for zoom rollback
    const previousMinMaxRef = useRef({ min: null, max: null });

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Compressed Data',
                data: compressedData.map((value, index) => ({
                    x: compressedLabels[index],
                    y: value
                })),
                borderColor: '#8884d8',
                borderWidth: 2,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 5,
                spanGaps: false
            },
            {
                label: 'Raw Data',
                data: rawData.map((value, index) => ({
                    x: labels[index],
                    y: value
                })),
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
                type: 'category',
                title: {
                    display: true,
                    text: 'Time',
                    font: { size: 14 },
                    padding: { top: 10, bottom: 10 }
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                    font: { size: 12 }
                },
                grid: { display: false },
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
            }
        },
        plugins: {
            zoom: {
                pan: { enabled: true, mode: 'xy' ,speed: 5},
                zoom: {
                    enabled: true,
                    mode: 'xy',
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    // Handle zoom completion logic
                    onZoomComplete: ({ chart }) => {
                        const xScale = chart.scales.x;
                        const labels = xScale.getLabels();

                        // Count how many tick labels are currently visible
                        let visibleCount = 0;
                        for (let i = 0; i < labels.length; i++) {
                            const px = xScale.getPixelForTick(i);
                            if (px >= xScale.left && px <= xScale.right) {
                                visibleCount++;
                            }
                        }

                        if (visibleCount <= 3) {
                            // Prevent further zoom: lock to 3-point range around the center
                            const centerIndex = Math.floor(labels.length / 2);
                            const minIndex = Math.max(centerIndex - 1, 0);
                            const maxIndex = Math.min(centerIndex + 1, labels.length - 1);

                            xScale.options.min = labels[minIndex];
                            xScale.options.max = labels[maxIndex];
                            chart.update();
                        } else {
                            const firstValidIndex = labels.findIndex(label =>
                                chart.data.datasets.some(ds => ds.data.some(d => d.x === label))
                            );
                            const lastValidIndex = labels.length - 1 - [...labels].reverse().findIndex(label =>
                                chart.data.datasets.some(ds => ds.data.some(d => d.x === label))
                            );

                            if (xScale.min < firstValidIndex || xScale.max > lastValidIndex) {
                                xScale.options.min = labels[firstValidIndex];
                                xScale.options.max = labels[lastValidIndex];
                                chart.update();
                            } else {
                                previousMinMaxRef.current.min = xScale.min;
                                previousMinMaxRef.current.max = xScale.max;
                            }
                        }
                    }
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
