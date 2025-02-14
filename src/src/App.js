// Import necessary modules and components from React and other files
import React, { useRef, useState } from 'react';
import ConfigPanel from './components/ConfigPanel';
import MetricsTable from './components/CompressionMatrixTable';
import CompressionSidebarPanel from './components/CompressionSidebarPanel';
import ZoomableChart from './components/Chart';

// Main App component
function App() {
    // Raw data array that will be used for compression
    const rawData = [10, 30, 20, 50, 40, 60, 80, 70, 90, 100, 85, 95, 75, 65, 55];

    // State to manage the compression factor
    const [compressionFactor, setCompressionFactor] = useState(2);

    // State to manage the sidebar's open/close state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Function to compress the raw data based on the compression factor
    const compressData = (data, factor) => {
        const compressedData = [];
        for (let i = 0; i < data.length; i += factor) {
            compressedData.push(data[i]); // Add every nth element to the compressed data array
        }
        return compressedData;
    };

    // Compressed data derived from the raw data and compression factor
    const compressedData = compressData(rawData, compressionFactor);

    // Sample configurations for the sidebar panel
    const sampleConfigurations = [
        { name: 'Config 1', date: '2025-01-30T12:00:00Z', parameters: { param1: 'value1', param2: 'value2' } },
        { name: 'Config 2', date: '2025-01-29T15:30:00Z', parameters: { param1: 'value3', param2: 'value4' } },
        { name: 'Config 3', date: '2025-01-28T09:00:00Z', parameters: { param1: 'value5', param2: 'value6' } },
        { name: 'Config 4', date: '2025-01-28T13:45:00Z', parameters: { param1: 'value7', param2: 'value8' } },
        { name: 'Config 5', date: '2025-01-27T10:00:00Z', parameters: { param1: 'value9', param2: 'value10' } }
    ];

    // Function to handle saving the optimal configuration
    const handleSave = (data) => {
        console.log('Saved data:', data); // Log the saved data
        alert('Optimal configuration saved!'); // Show an alert to the user
    };

    // Ref to access the ConfigPanel component
    const configPanelRef = useRef(null);

    // Function to handle creating a new configuration by resetting the ConfigPanel
    const handleNewConfig = () => {
        if (configPanelRef.current) {
            configPanelRef.current.reset(); // Call the reset method of ConfigPanel
        }
    };

    // Function to toggle the sidebar's open/close state
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Main render method for the App component
    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
            <h2>Intelligent Plant Compression Optimisation</h2>
            <div style={{ width: '80%' }}>
                {/* Sidebar panel component */}
                <CompressionSidebarPanel
                    configurations={sampleConfigurations} // Pass sample configurations
                    onNewConfig={handleNewConfig} // Pass the new config handler
                    isOpen={isSidebarOpen} // Pass the sidebar's open/close state
                    toggleSidebar={toggleSidebar} // Pass the toggle function
                />
            </div>

            {/* Configuration panel */}
            <div
                style={{
                    width: '80%',
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0', // Adjust margin based on sidebar state
                    transition: 'margin-left 0.3s ease', // Add transition effect
                }}
            >
                <ConfigPanel
                    ref={configPanelRef} // Pass the ref to ConfigPanel
                    compressionFactor={compressionFactor} // Pass the compression factor
                    setCompressionFactor={setCompressionFactor} // Pass the setter for compression factor
                />
            </div>

            {/* Zoomable chart component */}
            <div
                style={{
                    width: '80%',
                    flexGrow: 1,
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0', // Adjust margin based on sidebar state
                    transition: 'margin-left 0.3s ease', // Add transition effect
                }}
            >
                <ZoomableChart rawData={rawData} compressionFactor={compressionFactor} />
            </div>

            {/* Metrics table component */}
            <div
                style={{
                    width: '80%',
                    flexShrink: 0,
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0', // Adjust margin based on sidebar state
                    transition: 'margin-left 0.3s ease', // Add transition effect
                }}
            >
                <MetricsTable
                    rawData={rawData} // Pass the raw data
                    compressedData={compressedData} // Pass the compressed data
                    onSave={handleSave} // Pass the save handler
                />
            </div>
        </div>
    );
}

export default App;