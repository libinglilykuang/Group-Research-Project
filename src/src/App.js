import React, { useState, useRef, useEffect } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MetricsTable from "./components/CompressionMatrixTable";
import CompressionSidebarPanel from "./components/CompressionSidebarPanel";
import ZoomableChart from "./components/Chart";

// TODO: Remove Firebase imports and replace with Azure SDK
// Example: import { BlobServiceClient } from "@azure/storage-blob";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// 🔥 将 compressData 提到外面，并保留可测试
export const compressData = (
    data,
    labels,
    compressionDeviationLimit,
    compressionDeviationType,
    exceptionFilterDeviationLimit,
    exceptionFilterDeviationType
) => {
    const compressedData = [];
    const compressedLabels = [];

    // TODO: Replace local compression logic with a call to the backend compression API
    // Example: Call a backend API endpoint to perform compression
    // Example: const response = await fetch("/api/compress", { method: "POST", body: JSON.stringify({ data, labels, ... }) });
    // Example: const { compressedData, compressedLabels } = await response.json();

    // Example compression logic (to be replaced)
    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        const label = labels[i];

        // Apply compression deviation limit
        if (compressionDeviationLimit && Math.abs(value) > compressionDeviationLimit) {
            continue; // Skip values exceeding the limit
        }

        // Apply compression deviation type
        if (compressionDeviationType === "percentage") {
            // Example: Skip values that are within a percentage range
            if (i > 0 && Math.abs((value - data[i - 1]) / data[i - 1]) * 100 < compressionDeviationLimit) {
                continue;
            }
        } else if (compressionDeviationType === "absolute") {
            // Example: Skip values that are within an absolute range
            if (i > 0 && Math.abs(value - data[i - 1]) < compressionDeviationLimit) {
                continue;
            }
        }

        // Apply exception filter deviation limit
        if (exceptionFilterDeviationLimit && Math.abs(value) > exceptionFilterDeviationLimit) {
            continue; // Skip values exceeding the exception filter limit
        }

        // Apply exception filter deviation type
        if (exceptionFilterDeviationType === "percentage") {
            // Example: Skip values that are within a percentage range
            if (i > 0 && Math.abs((value - data[i - 1]) / data[i - 1]) * 100 < exceptionFilterDeviationLimit) {
                continue;
            }
        } else if (exceptionFilterDeviationType === "absolute") {
            // Example: Skip values that are within an absolute range
            if (i > 0 && Math.abs(value - data[i - 1]) < exceptionFilterDeviationLimit) {
                continue;
            }
        }

        // Add the value and label to the compressed data
        compressedData.push(value);
        compressedLabels.push(label);
    }

    return { compressedData, compressedLabels };
};

function App() {
    // State variables
    const [rawData, setRawData] = useState([]); // Stores raw data for the chart
    const [labels, setLabels] = useState([]); // Stores labels for the chart
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls sidebar visibility
    const [configurations, setConfigurations] = useState([]); // Stores user configurations
    const [file, setFile] = useState(null); // Stores the current CSV file

    const configPanelRef = useRef(null); // Reference to the ConfigPanel component

    // TODO: Initialize Azure Blob Storage or Cosmos DB client here
    // Example: const blobServiceClient = BlobServiceClient.fromConnectionString("<Your-Azure-Connection-String>");
    // Example: const containerClient = blobServiceClient.getContainerClient("<Your-Container-Name>");

    // Effect to load configurations on component mount
    useEffect(() => {
        loadConfigurations(); // Load configurations directly
    }, []);

    // Function to load configurations from Firestore
    const loadConfigurations = async () => {
        try {
            // TODO: Replace Firebase Firestore logic with Azure storage logic
            // Example: Load configurations from Azure Blob Storage or Cosmos DB
            const querySnapshot = await getDocs(collection(db, "configurations")); // Load all configurations
            const configs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setConfigurations(configs); // Update state with loaded configurations
        } catch (error) {
            console.error("Error loading configurations:", error);
        }
    };

    // Function to save a configuration to Firestore
    const handleSave = async (config) => {
        // Create a new configuration object
        const newConfig = {
            ...config,
            name: `Configuration ${configurations.length + 1}`, // Generate a dynamic name
            date: new Date().toISOString(), // Add the current timestamp
            parameters: {
                ...config.parameters,
            },
            rawData: config.includeCSV ? rawData.join("\n") : null, // Store CSV content if included
            labels: config.includeCSV ? labels : null, // Store labels if included
        };

        try {
            // TODO: Replace Firebase Firestore logic with Azure storage logic
            // Example: Save configuration to Azure Blob Storage or Cosmos DB
            const docRef = await addDoc(collection(db, "configurations"), newConfig);
            console.log("Document written with ID:", docRef.id);

            // Update local state with the new configuration
            setConfigurations((prevConfigs) => [...prevConfigs, { id: docRef.id, ...newConfig }]);
            alert("Optimal configuration saved!");
        } catch (error) {
            console.error("Error saving configuration:", error);
            alert("Failed to save configuration. Please try again.");
        }
    };

    // Function to create a new configuration
    const handleNewConfig = () => {
        if (configPanelRef.current) {
            configPanelRef.current.reset(); // Reset the ConfigPanel
        }
        setFile(null); // Clear the current CSV file
    };

    // Function to toggle the sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Function to load a configuration into the UI
    const handleLoadConfig = (config) => {
        // Load raw data and labels into the chart
        setRawData(config.rawData ? config.rawData.split("\n") : []);
        setLabels(config.labels || []);

        // Load parameters into the ConfigPanel
        if (configPanelRef.current) {
            configPanelRef.current.setParams(config.parameters);
        }
    };

    // Function to get compression parameters from the ConfigPanel
    const getCompressionParameters = () => {
        if (configPanelRef.current) {
            return configPanelRef.current.getParams();
        }
        return {
            compressionDeviationLimit: null,
            compressionDeviationType: null,
            exceptionFilterDeviationLimit: null,
            exceptionFilterDeviationType: null,
        };
    };

    // Get parameters and compress the data
    const {
        compressionDeviationLimit,
        compressionDeviationType,
        exceptionFilterDeviationLimit,
        exceptionFilterDeviationType,
    } = getCompressionParameters();

    const { compressedData, compressedLabels } = compressData(
        rawData,
        labels,
        compressionDeviationLimit,
        compressionDeviationType,
        exceptionFilterDeviationLimit,
        exceptionFilterDeviationType
    );

    return (
        <div
            className="App"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                backgroundImage: "url(/icons/background.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                padding: "20px",
            }}
        >
            {/* Main interface */}
            <h2 style={{ color: "#333", marginBottom: "20px" }}>Intelligent Plant Compression Optimisation</h2>
            <div style={{ width: "80%" }}>
                <CompressionSidebarPanel
                    configurations={configurations}
                    setConfigurations={setConfigurations} // Pass setConfigurations here
                    onNewConfig={handleNewConfig}
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    onLoadConfig={handleLoadConfig}
                />
            </div>

            <div
                style={{
                    width: "80%",
                    marginBottom: "20px",
                    marginLeft: isSidebarOpen ? "250px" : "0",
                    transition: "margin-left 0.3s ease",
                }}
            >
                <ConfigPanel
                    ref={configPanelRef}
                    setRawData={setRawData}
                    setLabels={setLabels}
                    setFile={setFile}
                />
            </div>

            <div
                style={{
                    width: "80%",
                    flexGrow: 1,
                    marginBottom: "20px",
                    marginLeft: isSidebarOpen ? "250px" : "0",
                    transition: "margin-left 0.3s ease",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    padding: "20px",
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
                    width: "80%",
                    flexShrink: 0,
                    marginBottom: "20px",
                    marginLeft: isSidebarOpen ? "250px" : "0",
                    transition: "margin-left 0.3s ease",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    padding: "20px",
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
