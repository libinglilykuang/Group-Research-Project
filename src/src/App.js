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

    const sampleConfigurations = [
        { name: 'Config 1', date: '2025-01-30T12:00:00Z', parameters: { param1: 'value1', param2: 'value2' } },
        { name: 'Config 2', date: '2025-01-29T15:30:00Z', parameters: { param1: 'value3', param2: 'value4' } },
        { name: 'Config 3', date: '2025-01-28T09:00:00Z', parameters: { param1: 'value5', param2: 'value6' } },
        { name: 'Config 4', date: '2025-01-28T13:45:00Z', parameters: { param1: 'value7', param2: 'value8' } },
        { name: 'Config 5', date: '2025-01-27T10:00:00Z', parameters: { param1: 'value9', param2: 'value10' } }
    ];

    const handleSave = (data) => {
        console.log('Saved data:', data);
        alert('Optimal configuration saved!');
    };

    const configPanelRef = useRef(null);

    const handleNewConfig = () => {
        if (configPanelRef.current) {
            configPanelRef.current.reset();
        }
    };

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
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
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
                />
            </div>

            <div
                style={{
                    width: '80%',
                    flexGrow: 1,
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0',
                    transition: 'margin-left 0.3s ease',
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