import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

const ZoomableChart = ({ rawData, labels, compressedData, compressedLabels }) => {
  const isEmpty = !rawData.length || !labels.length;

  const chartData = {
    labels: isEmpty ? [] : labels,
    datasets: [
      {
        label: "Raw Data",
        data: isEmpty
          ? []
          : rawData.map((value, index) => ({ x: labels[index], y: value })),
        borderColor: "#82ca9d",
        borderWidth: 2,
        fill: false,
        pointRadius: 2,
        tension: 0,
      },
      {
        label: "Compressed Data",
        data: isEmpty
          ? []
          : compressedData.map((value, index) => ({
              x: compressedLabels[index],
              y: value,
            })),
        borderColor: "#8884d8",
        borderWidth: 2,
        fill: false,
        pointRadius: 5,
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: {
            minute: "HH:mm:ss",
          },
        },
        title: {
          display: true,
          text: "Time",
          font: { size: 16 },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          font: { size: 14 },
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
          font: { size: 16 },
        },
        ticks: {
          font: { size: 14 },
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
          modifierKey: null,
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          drag: {
            enabled: false,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
          limits: {
            x: {
              min: "original",
              max: "original",
            },
            y: {
              min: "original",
              max: "original",
            },
          },
        },
      },
      title: {
        display: isEmpty,
        text: "Please upload CSV data to display the chart",
        font: { size: 18 },
        color: "gray",
        padding: 20,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ZoomableChart;
