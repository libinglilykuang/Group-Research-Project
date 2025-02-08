import React, { useRef, useState } from 'react';
import ConfigPanel from './components/ConfigPanel';
import MetricsTable from './components/CompressionMatrixTable';
import CompressionSidebarPanel from './components/CompressionSidebarPanel';
import ZoomableChart from './components/Chart';

function App() {
    const rawData = [10, 30, 20, 50, 40, 60, 80, 70, 90, 100, 85, 95, 75, 65, 55];
    const [compressionFactor, setCompressionFactor] = useState(2);

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

    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
            <h1>Welcome to the App</h1>
            <div style={{ width: '80%' }}>
                <CompressionSidebarPanel
                    configurations={sampleConfigurations}
                    onNewConfig={handleNewConfig} // Pass the callback function
                />
            </div>

            <div style={{ width: '80%', marginBottom: '20px' }}>
                <ConfigPanel
                    ref={configPanelRef}
                    compressionFactor={compressionFactor}
                    setCompressionFactor={setCompressionFactor}
                />
            </div>

            <div style={{ width: '80%', flexGrow: 1, marginBottom: '20px' }}>
                <ZoomableChart rawData={rawData} compressionFactor={compressionFactor} />
            </div>

            <div style={{ width: '80%', flexShrink: 0, marginBottom: '20px' }}>
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