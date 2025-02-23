import React, { useState, useRef } from 'react';
import ConfigPanel from './components/ConfigPanel';
import MetricsTable from './components/CompressionMatrixTable';
import CompressionSidebarPanel from './components/CompressionSidebarPanel';
import ZoomableChart from './components/Chart';

function App() {
    const [rawData, setRawData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [compressionFactor, setCompressionFactor] = useState(2);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [configurations, setConfigurations] = useState([]);
    const [file, setFile] = useState(null); // 用于存储当前 CSV 文件

    const configPanelRef = useRef(null);

    const compressData = (data, labels, factor) => {
        const compressedData = [];
        const compressedLabels = [];
        for (let i = 0; i < data.length; i += factor) {
            compressedData.push(data[i]);
            compressedLabels.push(labels[i]); // 保留原始数据的横坐标
        }
        return { compressedData, compressedLabels };
    };

    const { compressedData, compressedLabels } = compressData(rawData, labels, compressionFactor);

    const handleSave = (config) => {
        const params = configPanelRef.current ? configPanelRef.current.getParams() : { param1: '', param2: '' };
        const newConfig = {
            ...config,
            name: `Configuration ${configurations.length + 1}`, // 动态生成名称
            date: new Date().toISOString(),
            parameters: {
                ...config.parameters,
                ...params,
            },
            rawData: config.includeCSV ? rawData : null, // 如果用户选择保存 CSV 文件，则保存原始数据
            labels: config.includeCSV ? labels : null,   // 如果用户选择保存 CSV 文件，则保存原始标签
            csvFile: config.includeCSV ? file : null,    // 如果用户选择保存 CSV 文件，则保存原始文件
        };
        setConfigurations((prevConfigs) => [...prevConfigs, newConfig]);
        alert('Optimal configuration saved!');
    };

    const handleNewConfig = () => {
        if (configPanelRef.current) {
            configPanelRef.current.reset();
        }
        setFile(null); // 清除当前 CSV 文件
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // 加载配置
    const handleLoadConfig = (config) => {
        // 加载原始数据到 Chart
        setRawData(config.rawData || []);
        setLabels(config.labels || []);
        // 加载参数到 ConfigPanel
        if (configPanelRef.current) {
            configPanelRef.current.setParams(config.parameters);
            if (config.csvFile) {
                configPanelRef.current.loadFile(config.csvFile); // 如果包含 CSV 文件，则加载
            }
        }
    };

    return (
        <div
            className="App"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f0f0f0', // 主界面背景色改为浅灰色
                padding: '20px',
            }}
        >
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Intelligent Plant Compression Optimisation</h2>
            <div style={{ width: '80%' }}>
                <CompressionSidebarPanel
                    configurations={configurations}
                    onNewConfig={handleNewConfig}
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    onLoadConfig={handleLoadConfig} // 传递加载配置的回调函数
                />
            </div>

            <div
                style={{
                    width: '80%',
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0',
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <ConfigPanel
                    ref={configPanelRef}
                    compressionFactor={compressionFactor}
                    setCompressionFactor={setCompressionFactor}
                    setRawData={setRawData}
                    setLabels={setLabels}
                    setFile={setFile} // 传递 setFile 函数以更新当前 CSV 文件
                />
            </div>

            <div
                style={{
                    width: '80%',
                    flexGrow: 1,
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0',
                    transition: 'margin-left 0.3s ease',
                    backgroundColor: '#ffffff', // 图表区域背景色为白色
                    borderRadius: '8px', // 添加圆角
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影
                    padding: '20px',
                }}
            >
                <ZoomableChart
                    rawData={rawData}
                    labels={labels}
                    compressedData={compressedData}
                    compressedLabels={compressedLabels}
                />
            </div>

            <div
                style={{
                    width: '80%',
                    flexShrink: 0,
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0',
                    transition: 'margin-left 0.3s ease',
                    backgroundColor: '#ffffff', // 表格区域背景色为白色
                    borderRadius: '8px', // 添加圆角
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影
                    padding: '20px',
                }}
            >
                <MetricsTable
                    rawData={rawData}
                    compressedData={compressedData}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
}

export default App;