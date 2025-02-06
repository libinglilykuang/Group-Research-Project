import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// 注册所需的模块
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin // 注册zoom插件
);

const ZoomableChart = ({ rawData, compressionFactor }) => {
    const chartContainerRef = useRef(null); // 用于引用图表容器
    const chartRef = useRef(null); // 用于引用图表实例

    // 生成标签
    const labels = rawData.map((_, index) => index + 1);

    // 压缩数据
    const compressData = (data, factor) => {
        const compressedData = [];
        for (let i = 0; i < data.length; i += factor) {
            compressedData.push(data[i]);
        }
        return compressedData;
    };

    const compressedData = compressData(rawData, compressionFactor);

    // 图表数据
    const chartData = {
        labels: labels, // X轴标签
        datasets: [
            {
                label: 'Raw Data', // 原始数据
                data: rawData,
                borderColor: '#8884d8',
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'Compressed Data', // 压缩数据
                data: compressedData,
                borderColor: '#82ca9d',
                borderWidth: 2,
                fill: false,
                pointRadius: 5, // 突出显示压缩数据的点
            },
        ],
    };

    // 图表配置
    const options = {
        responsive: true,
        maintainAspectRatio: false, // 不保持宽高比，允许自定义尺寸
        scales: {
            x: {
                type: 'linear', // X轴为线性
                position: 'bottom',
                title: {
                    display: true,
                    text: 'X Axis',
                    font: {
                        size: 16, // 增大X轴标题字体
                    },
                },
                ticks: {
                    font: {
                        size: 14, // 增大X轴刻度字体
                    },
                },
                min: 1, // 初始最小范围
                max: 10, // 初始最大范围
            },
            y: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Y Axis',
                    font: {
                        size: 16, // 增大Y轴标题字体
                    },
                },
                ticks: {
                    font: {
                        size: 14, // 增大Y轴刻度字体
                    },
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true, // 启用tooltip
                bodyFont: {
                    size: 14, // 增大tooltip字体
                },
                titleFont: {
                    size: 16, // 增大tooltip标题字体
                },
            },
            legend: {
                labels: {
                    font: {
                        size: 16, // 增大图例字体
                    },
                },
            },
            zoom: {
                pan: {
                    enabled: true, // 启用平移
                    mode: 'x', // 仅沿X轴平移
                    threshold: 10, // 拖拽触发的最小距离
                    onPan: function ({ chart }) {
                        const { min, max } = chart.scales.x;
                        // 动态更新数据范围
                        chart.options.scales.x.min = min;
                        chart.options.scales.x.max = max;
                        chart.update(); // 更新图表
                    },
                },
                zoom: {
                    enabled: true, // 启用缩放
                    mode: 'xy', // 同时缩放X轴和Y轴
                    speed: 0.1, // 缩放速度
                    threshold: 10, // 滚动触发的最小距离
                    sensitivity: 1,
                    limits: {
                        x: { min: 1, max: labels.length },
                        y: { min: 0, max: 100 },
                    },
                    wheel: {
                        enabled: true, // 启用缩放
                        mode: 'xy',
                        speed: 0.1,
                        threshold: 10,
                        onZoom: function ({ chart, event }) {
                            const { offsetX, offsetY } = event; // 获取鼠标位置
                            const chartArea = chart.chartArea;
                            // 计算鼠标相对于图表的坐标比例
                            const xPercent = (offsetX - chartArea.left) / chartArea.width;
                            const yPercent = (offsetY - chartArea.top) / chartArea.height;

                            // 根据鼠标滚轮的方向来缩放
                            const zoomLevel = event.deltaY < 0 ? 1.1 : 0.9; // 向上滚动放大，向下滚动缩小

                            // 获取当前的缩放比例
                            const currentZoomX = chart.options.scales.x.zoomLevel || 1;
                            const currentZoomY = chart.options.scales.y.zoomLevel || 1;

                            // 计算新的缩放比例
                            const newZoomX = currentZoomX * zoomLevel;
                            const newZoomY = currentZoomY * zoomLevel;

                            // 更新图表的缩放比例
                            chart.options.scales.x.zoomLevel = newZoomX;
                            chart.options.scales.y.zoomLevel = newZoomY;

                            // 更新图表
                            chart.update();
                            event.preventDefault(); // 阻止默认滚动行为
                        },
                    },
                },
            },
        },
    };

    // 阻止滚动事件默认行为
    const handleWheel = (event) => {
        if (chartContainerRef.current && chartContainerRef.current.contains(event.target)) {
            event.preventDefault(); // 阻止页面滚动
        }
    };

    // 添加滚轮事件监听
    useEffect(() => {
        const container = chartContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        // 清理事件监听器
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    return (
        <div
            ref={chartContainerRef} // 引用图表容器
            style={{ width: '100%', height: '500px', overflow: 'hidden' }} // 增大容器尺寸
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