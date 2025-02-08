import React, { useRef, useState } from 'react';
import ConfigPanel from './components/ConfigPanel';
import MetricsTable from './components/CompressionMatrixTable';
import CompressionSidebarPanel from './components/CompressionSidebarPanel';
import ZoomableChart from './components/Chart';

function App() {
    const rawData = [10, 30, 20, 50, 40, 60, 80, 70, 90, 100, 85, 95, 75, 65, 55];
    const [compressionFactor, setCompressionFactor] = useState(2);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 控制侧边栏状态

    // Function to compress data based on the compression factor
    const compressData = (data, factor) => {
        const compressedData = [];
        for (let i = 0; i < data.length; i += factor) {
            compressedData.push(data[i]);
        }
        return compressedData;
    };

    const compressedData = compressData(rawData, compressionFactor);

    // Sample configurations for the sidebar panel
    const sampleConfigurations = [
        { name: 'Config 1', date: '2025-01-30T12:00:00Z', parameters: { param1: 'value1', param2: 'value2' } },
        { name: 'Config 2', date: '2025-01-29T15:30:00Z', parameters: { param1: 'value3', param2: 'value4' } },
        { name: 'Config 3', date: '2025-01-28T09:00:00Z', parameters: { param1: 'value5', param2: 'value6' } },
        { name: 'Config 4', date: '2025-01-28T13:45:00Z', parameters: { param1: 'value7', param2: 'value8' } },
        { name: 'Config 5', date: '2025-01-27T10:00:00Z', parameters: { param1: 'value9', param2: 'value10' } }
    ];

    // Handle saving the optimal configuration
    const handleSave = (data) => {
        console.log('Saved data:', data);
        alert('Optimal configuration saved!');
    };

    const configPanelRef = useRef(null);

    // Handle creating a new configuration by resetting the ConfigPanel
    const handleNewConfig = () => {
        if (configPanelRef.current) {
            configPanelRef.current.reset(); // Call the reset method of ConfigPanel
        }
    };

    // 切换侧边栏状态
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
            <h2>Intelligent Plant Compression Optimisation</h2>
            <div style={{ width: '80%' }}>
                <CompressionSidebarPanel
                    configurations={sampleConfigurations}
                    onNewConfig={handleNewConfig}
                    isOpen={isSidebarOpen} // 传递侧边栏状态
                    toggleSidebar={toggleSidebar} // 传递切换侧边栏的函数
                />
            </div>

            {/* 配置面板 */}
            <div
                style={{
                    width: '80%',
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0', // 根据侧边栏状态调整 marginLeft
                    transition: 'margin-left 0.3s ease', // 添加过渡效果
                }}
            >
                <ConfigPanel
                    ref={configPanelRef}
                    compressionFactor={compressionFactor}
                    setCompressionFactor={setCompressionFactor}
                />
            </div>

            {/* 图表 */}
            <div
                style={{
                    width: '80%',
                    flexGrow: 1,
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0', // 根据侧边栏状态调整 marginLeft
                    transition: 'margin-left 0.3s ease', // 添加过渡效果
                }}
            >
                <ZoomableChart rawData={rawData} compressionFactor={compressionFactor} />
            </div>

            {/* 数据表格 */}
            <div
                style={{
                    width: '80%',
                    flexShrink: 0,
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0', // 根据侧边栏状态调整 marginLeft
                    transition: 'margin-left 0.3s ease', // 添加过渡效果
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