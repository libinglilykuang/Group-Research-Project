import React, { useState, useRef } from 'react';
import ConfigPanel from './components/ConfigPanel';
import MetricsTable from './components/CompressionMatrixTable';
import CompressionSidebarPanel from './components/CompressionSidebarPanel';
import ZoomableChart from './components/Chart';

function App() {
    const [rawData, setRawData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [configurations, setConfigurations] = useState([]);
    const [file, setFile] = useState(null); // Used to store the current CSV file

    const configPanelRef = useRef(null);

    // Compress data based on the new parameters
    const compressData = (data, labels, deviationLimit, deviationType, callbackFilter, exceptionFilter) => {
        const compressedData = [];
        const compressedLabels = [];

        // Example compression logic based on the new parameters
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const label = labels[i];

            // Apply deviation limit
            if (deviationLimit && Math.abs(value) > deviationLimit) {
                continue; // Skip values exceeding the deviation limit
            }

            // Apply deviation type (example: positive or negative deviations)
            if (deviationType === 'positive' && value < 0) {
                continue; // Skip negative values if deviationType is 'positive'
            } else if (deviationType === 'negative' && value > 0) {
                continue; // Skip positive values if deviationType is 'negative'
            }

            // Apply callback filter (example: custom filtering logic)
            if (callbackFilter && !callbackFilter(value)) {
                continue; // Skip values that don't pass the callback filter
            }

            // Apply exception filter (example: exclude specific values)
            if (exceptionFilter && exceptionFilter(value)) {
                continue; // Skip values that match the exception filter
            }

            // Add the value and label to the compressed data
            compressedData.push(value);
            compressedLabels.push(label);
        }

        return { compressedData, compressedLabels };
    };

    // Get the parameters from the ConfigPanel
    const getCompressionParameters = () => {
        if (configPanelRef.current) {
            return configPanelRef.current.getParams();
        }
        return {
            deviationLimit: null,
            deviationType: null,
            callbackFilter: null,
            exceptionFilter: null,
        };
    };

    // Compress the data using the current parameters
    const { deviationLimit, deviationType, callbackFilter, exceptionFilter } = getCompressionParameters();
    const { compressedData, compressedLabels } = compressData(
        rawData,
        labels,
        deviationLimit,
        deviationType,
        callbackFilter,
        exceptionFilter
    );

    // Handle saving configurations
    const handleSave = (config) => {
        const params = configPanelRef.current ? configPanelRef.current.getParams() : {
            deviationLimit: null,
            deviationType: null,
            callbackFilter: null,
            exceptionFilter: null,
        };
        const newConfig = {
            ...config,
            name: `Configuration ${configurations.length + 1}`, // Dynamically generate a name
            date: new Date().toISOString(),
            parameters: {
                ...config.parameters,
                ...params,
            },
            rawData: config.includeCSV ? rawData : null, // Save raw data if the user chooses to include the CSV file
            labels: config.includeCSV ? labels : null,   // Save labels if the user chooses to include the CSV file
            csvFile: config.includeCSV ? file : null,    // Save the CSV file if the user chooses to include it
        };
        setConfigurations((prevConfigs) => [...prevConfigs, newConfig]);
        alert('Optimal configuration saved!');
    };

    // Handle creating a new configuration
    const handleNewConfig = () => {
        if (configPanelRef.current) {
            configPanelRef.current.reset();
        }
        setFile(null); // Clear the current CSV file
    };

    // Toggle the sidebar open/close
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Load a configuration
    const handleLoadConfig = (config) => {
        // Load raw data into the Chart
        setRawData(config.rawData || []);
        setLabels(config.labels || []);
        // Load parameters into the ConfigPanel
        if (configPanelRef.current) {
            configPanelRef.current.setParams(config.parameters);
            if (config.csvFile) {
                configPanelRef.current.loadFile(config.csvFile); // Load the CSV file if included
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
                backgroundColor: '#f0f0f0', // Main background color set to light gray
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
                    onLoadConfig={handleLoadConfig} // Pass the load configuration callback
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
                    setRawData={setRawData}
                    setLabels={setLabels}
                    setFile={setFile} // Pass the setFile function to update the current CSV file
                />
            </div>

            <div
                style={{
                    width: '80%',
                    flexGrow: 1,
                    marginBottom: '20px',
                    marginLeft: isSidebarOpen ? '250px' : '0',
                    transition: 'margin-left 0.3s ease',
                    backgroundColor: '#ffffff', // Chart area background color set to white
                    borderRadius: '8px', // Add rounded corners
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Add shadow
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
                    backgroundColor: '#ffffff', // Table area background color set to white
                    borderRadius: '8px', // Add rounded corners
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Add shadow
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