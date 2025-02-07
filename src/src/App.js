import React, { useState } from 'react';
import ConfigPanel from './components/ConfigPanel';
import MetricsTable from './components/CompressionMatrixTable';
import CompressionSidebarPanel from './components/CompressionSidebarPanel';
import ZoomableChart from './components/Chart';

function App() {
    // Original Data
    const rawData = [10, 30, 20, 50, 40, 60, 80, 70, 90, 100, 85, 95, 75, 65, 55];

    // Compression Factor
    const [compressionFactor, setCompressionFactor] = useState(2);

    // Compression Data
    const compressData = (data, factor) => {
        const compressedData = [];
        for (let i = 0; i < data.length; i += factor) {
            compressedData.push(data[i]);
        }
        return compressedData;
    };

    const compressedData = compressData(rawData, compressionFactor);

    // Example configuration
    const sampleConfigurations = [
        { name: 'Config A', group: 'Group 1' },
        { name: 'Config B', group: 'Group 2' },
        { name: 'Config C', group: 'Group 3' },
    ];

    const handleSave = (data) => {
        console.log('Saved data:', data);
        alert('Optimal configuration saved!');
    };

    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
            <h1>Welcome to the App</h1>
            <div style={{ width: '80%' }}>
                <CompressionSidebarPanel configurations={sampleConfigurations} />
            </div>

            <div style={{ width: '80%', marginBottom: '20px' }}>
                <ConfigPanel
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