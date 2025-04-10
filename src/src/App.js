import React, { useState, useRef, useEffect } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MetricsTable from "./components/CompressionMatrixTable";
import CompressionSidebarPanel from "./components/CompressionSidebarPanel";
import ZoomableChart from "./components/Chart";
import { TableClient, AzureSASCredential } from "@azure/data-tables";

function App() {
  const [rawData, setRawData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [compressedData, setCompressedData] = useState([]);
  const [compressedLabels, setCompressedLabels] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const configPanelRef = useRef(null);

  const sasToken = "?sv=2017-07-29&ss=t&srt=so&sp=rwdlacu&se=2026-01-01T00:00:00Z&st=2025-01-01T00:00:00Z&spr=https&sig=wK7MJiU907XljD3qFOQ0H4KJOL9pYYL8CteWYq5Rhfc%3D";
  const accountName = "team6ipstorageaccount";
  const tableClient = new TableClient(
    `https://${accountName}.table.core.windows.net`,
    "ipconfigurations",
    new AzureSASCredential(sasToken)
  );

  useEffect(() => {
    const loadConfigurations = async () => {
      console.log("Starting to load configurations from Azure...");
      try {
        const entities = [];
        for await (const entity of tableClient.listEntities()) {
          console.log("Fetched entity:", entity);
          entities.push({
            id: entity.rowKey,
            name: entity.name,
            date: entity.date,
            parameters: JSON.parse(entity.parameters || "{}"),
            rawData: entity.rawData || null,
            labels: entity.labels ? JSON.parse(entity.labels) : null,
          });
        }
        console.log("Loaded configurations:", entities);
        setConfigurations(entities);
        setLoading(false);
      } catch (err) {
        console.error("Error loading configurations from Azure:", err);
        setError(`Failed to load configurations from Azure: ${err.message}`);
        setLoading(false);
      }
    };
    loadConfigurations();
  }, []);

  const handleSave = async (config) => {
    const newConfig = {
      ...config,
      name: config.name || `Configuration ${configurations.length + 1}`,
      date: new Date().toISOString(),
      parameters: JSON.stringify(config.parameters),
      rawData: config.includeCSV ? rawData.join("\n") : null,
      labels: config.includeCSV ? JSON.stringify(labels) : null,
    };

    try {
      const entity = {
        partitionKey: "configurations",
        rowKey: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newConfig.name,
        date: newConfig.date,
        parameters: newConfig.parameters,
        rawData: newConfig.rawData,
        labels: newConfig.labels,
      };
      console.log("Saving entity:", entity);
      await tableClient.createEntity(entity);
      setConfigurations((prev) => [...prev, { id: entity.rowKey, ...newConfig, parameters: config.parameters }]);
      alert("Optimal configuration saved!");
    } catch (err) {
      console.error("Error saving configuration to Azure:", err);
      setError(`Failed to save configuration to Azure: ${err.message}`);
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

  const compressData = () => {
    if (!rawData.length || !labels.length) {
      setError("Please upload a file first");
      return;
    }
    const params = configPanelRef.current.getParams();
    const {
      compressionDeviationLimit,
      compressionDeviationType,
      exceptionFilterDeviationLimit,
      exceptionFilterDeviationType,
    } = params;

    const result = compressDataLogic(
      rawData,
      labels,
      compressionDeviationLimit,
      compressionDeviationType,
      exceptionFilterDeviationLimit,
      exceptionFilterDeviationType
    );
    setCompressedData(result.compressedData);
    setCompressedLabels(result.compressedLabels);
    setError(null);
  };

  const compressDataLogic = (
    data,
    labels,
    compressionDeviationLimit,
    compressionDeviationType,
    exceptionFilterDeviationLimit,
    exceptionFilterDeviationType
  ) => {
    const compressedData = [];
    const compressedLabels = [];

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const label = labels[i];

      if (compressionDeviationLimit && Math.abs(value) > compressionDeviationLimit) {
        continue;
      }

      if (compressionDeviationType === "percentage") {
        if (i > 0 && Math.abs((value - data[i - 1]) / data[i - 1]) * 100 < compressionDeviationLimit) {
          continue;
        }
      } else if (compressionDeviationType === "absolute") {
        if (i > 0 && Math.abs(value - data[i - 1]) < compressionDeviationLimit) {
          continue;
        }
      }

      if (exceptionFilterDeviationLimit && Math.abs(value) > exceptionFilterDeviationLimit) {
        continue;
      }

      if (exceptionFilterDeviationType === "percentage") {
        if (i > 0 && Math.abs((value - data[i - 1]) / data[i - 1]) * 100 < exceptionFilterDeviationLimit) {
          continue;
        }
      } else if (exceptionFilterDeviationType === "absolute") {
        if (i > 0 && Math.abs(value - data[i - 1]) < exceptionFilterDeviationLimit) {
          continue;
        }
      }

      compressedData.push(value);
      compressedLabels.push(label);
    }

    return { compressedData, compressedLabels };
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h1>Loading...</h1>
        <p>Fetching configurations from Azure Table Storage</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

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
