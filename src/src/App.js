import React, { useState, useRef, useEffect } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MetricsTable from "./components/CompressionMatrixTable";
import CompressionSidebarPanel from "./components/CompressionSidebarPanel";
import ZoomableChart from "./components/Chart";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { BlobServiceClient } from "@azure/storage-blob";

function App() {
    const [rawData, setRawData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [compressedData, setCompressedData] = useState([]);
    const [compressedLabels, setCompressedLabels] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [configurations, setConfigurations] = useState([]);
    const [file, setFile] = useState(null);

    const configPanelRef = useRef(null);

    // Hardcoded Azure Blob Storage setup
    const AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;EndpointSuffix=core.windows.net;AccountName=team6ipstorageaccount;AccountKey=Tt8rQKp/Vi6QAsxdTuSCJH1+s7HODqclwW4+/gZLUawwvDllOmKMRQq2wlOOFffQOmkdjHObgvMA+AStB3Sfog==;BlobEndpoint=https://team6ipstorageaccount.blob.core.windows.net/;FileEndpoint=https://team6ipstorageaccount.file.core.windows.net/;QueueEndpoint=https://team6ipstorageaccount.queue.core.windows.net/;TableEndpoint=https://team6ipstorageaccount.table.core.windows.net/";
    const FUNCTION_KEY = "cY1UQbInfG8J47x6HpICBc_rrCFwSNen_geoVqVGgZAEAzFuv_plDw==";
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const inputContainerClient = blobServiceClient.getContainerClient("ip-input-container");
    const outputContainerClient = blobServiceClient.getContainerClient("ip-output-container");

    useEffect(() => {
        loadConfigurations();
    }, []);

    const loadConfigurations = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "configurations"));
            const configs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setConfigurations(configs);
        } catch (error) {
            console.error("Error loading configurations:", error);
        }
    };

    const handleSave = async (config) => {
        const newConfig = {
            ...config,
            name: `Configuration ${configurations.length + 1}`,
            date: new Date().toISOString(),
            parameters: { ...config.parameters },
            rawData: config.includeCSV ? rawData.join("\n") : null,
            labels: config.includeCSV ? labels : null,
        };
        try {
            const docRef = await addDoc(collection(db, "configurations"), newConfig);
            setConfigurations((prevConfigs) => [...prevConfigs, { id: docRef.id, ...newConfig }]);
            alert("Optimal configuration saved!");
        } catch (error) {
            console.error("Error saving configuration:", error);
            alert("Failed to save configuration.");
        }
    };

    const handleNewConfig = () => {
        if (configPanelRef.current) {
            configPanelRef.current.reset();
        }
        setFile(null);
        setCompressedData([]);
        setCompressedLabels([]);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLoadConfig = (config) => {
        setRawData(config.rawData ? config.rawData.split("\n").map(Number) : []);
        setLabels(config.labels || []);
        setCompressedData([]);
        setCompressedLabels([]);
        if (configPanelRef.current) {
            configPanelRef.current.setParams(config.parameters);
        }
    };

    const compressData = async () => {
        if (!rawData.length || !labels.length) {
            alert("Please upload a CSV file first.");
            return;
        }

        const params = configPanelRef.current.getParams();
        const formattedData = rawData.map((value, index) => ({
            timestamp: labels[index],
            value,
        }));
        const payload = {
            rawData: formattedData,
            parameters: {
                deviationLimit: Number(params.compressionDeviationLimit),
                deviationType: params.compressionDeviationType,
            },
        };

        try {
            const rawBlobName = `raw-${Date.now()}.json`;
            const rawBlockBlobClient = inputContainerClient.getBlockBlobClient(rawBlobName);
            const rawDataJson = JSON.stringify(formattedData);
            await rawBlockBlobClient.upload(rawDataJson, rawDataJson.length);
            console.log(`Raw data uploaded to ${rawBlobName}`);

            const response = await fetch(
                `https://ip-team6-compression-function.azurewebsites.net/api/compressdata?code=${FUNCTION_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            setCompressedData(result.map(d => d.value));
            setCompressedLabels(result.map(d => d.timestamp));

            const compressedBlobName = `compressed-${Date.now()}.json`;
            const compressedBlockBlobClient = outputContainerClient.getBlockBlobClient(compressedBlobName);
            const compressedDataJson = JSON.stringify(result);
            await compressedBlockBlobClient.upload(compressedDataJson, compressedDataJson.length);
            console.log(`Compressed data uploaded to ${compressedBlobName}`);
        } catch (error) {
            console.error("Error during compression or storage:", error);
            alert("Compression or storage failed. Check console for details.");
        }
    };

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
            <h2 style={{ color: "#333", marginBottom: "20px" }}>
                Intelligent Plant Compression Optimisation
            </h2>
            <div style={{ width: "80%" }}>
                <CompressionSidebarPanel
                    configurations={configurations}
                    setConfigurations={setConfigurations}
                    onNewConfig={handleNewConfig}
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    onLoadConfig={handleLoadConfig}
                    compressedData={compressedData}
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
                    onCompress={compressData}
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
