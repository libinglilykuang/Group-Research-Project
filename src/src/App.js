import React, { useState, useRef, useEffect } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MetricsTable from "./components/CompressionMatrixTable";
import CompressionSidebarPanel from "./components/CompressionSidebarPanel";
import ZoomableChart from "./components/Chart";
import { TableClient, AzureSASCredential } from "@azure/data-tables";

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

  const FUNCTION_URL = "https://ip-team6-compression-function.azurewebsites.net/api/compressdata";
  const FUNCTION_KEY = "cY1UQbInfG8J47x6HpICBc_rrCFwSNen_geoVqVGgZAEAzFuv_plDw==";

  const parseTimestamp = (timestamp, index = 0) => {
    if (!timestamp || typeof timestamp !== "string") {
      console.warn("Invalid timestamp (not a string):", timestamp);
      return null;
    }

    if (timestamp.includes("T") && timestamp.endsWith("Z")) {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn("Invalid ISO 8601 timestamp:", timestamp);
        return null;
      }
      return date;
    }

    const timeMatch = timestamp.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
    if (timeMatch) {
      const [, hours, minutes, period] = timeMatch;
      let hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);

      if (period.toUpperCase() === "PM" && hour !== 12) {
        hour += 12;
      } else if (period.toUpperCase() === "AM" && hour === 12) {
        hour = 0;
      }

      const baseDate = new Date("2025-02-18T00:00:00Z");
      const date = new Date(baseDate.getTime() + index * 1000);
      date.setUTCHours(hour, minute, 0, 0);

      if (isNaN(date.getTime())) {
        console.warn("Invalid timestamp after parsing HH:mm AM/PM:", timestamp);
        return null;
      }
      return date;
    }

    console.warn("Invalid timestamp (unrecognized format):", timestamp);
    return null;
  };

  useEffect(() => {
    const loadConfigurations = async () => {
      console.log("Starting to load configurations from Azure...");
      try {
        const entities = [];
        for await (const entity of tableClient.listEntities()) {
          console.log("Fetched entity:", entity);
          let parsedLabels = [];
          try {
            parsedLabels = entity.labels ? JSON.parse(entity.labels) : [];
            parsedLabels = parsedLabels
              .map((label, index) => {
                const parsed = parseTimestamp(label, index);
                return parsed ? parsed.toISOString() : null;
              })
              .filter(label => label !== null);
          } catch (err) {
            console.error("Error parsing labels for entity:", entity, err);
            parsedLabels = [];
          }
          entities.push({
            id: entity.rowKey,
            name: entity.name,
            date: entity.date,
            parameters: JSON.parse(entity.parameters || "{}"),
            rawData: entity.rawData || null,
            labels: parsedLabels,
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
    const loadedLabels = config.labels || [];
    const validLabels = loadedLabels
      .map((label, index) => {
        const parsed = parseTimestamp(label, index);
        return parsed ? parsed.toISOString() : null;
      })
      .filter(label => label !== null);
    setLabels(validLabels);
    setCompressedData([]);
    setCompressedLabels([]);
    if (configPanelRef.current) {
      configPanelRef.current.setParams(config.parameters);
    }
  };

  const compressData = async () => {
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

    const parsedTimestamps = labels.map((label, index) => parseTimestamp(label, index))
      .filter(timestamp => timestamp !== null)
      .map(timestamp => timestamp.toISOString());

    if (parsedTimestamps.length !== rawData.length) {
      setError("Mismatch between raw data and timestamps after parsing. Please check the data.");
      return;
    }

    const requestData = {
      rawData: rawData.map((value, index) => ({
        timestamp: parsedTimestamps[index],
        value: value,
      })),
      parameters: {
        deviationLimit: compressionDeviationLimit || exceptionFilterDeviationLimit || 0,
        deviationType: (compressionDeviationType || exceptionFilterDeviationType || "absolute").toLowerCase(),
      },
    };

    console.log("Request Data:", JSON.stringify(requestData, null, 2));

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching from: ${FUNCTION_URL}?code=${FUNCTION_KEY}`);

      const response = await fetch(`${FUNCTION_URL}?code=${FUNCTION_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
      }

      const result = await response.json();
      console.log("Response Data:", result);

      if (!Array.isArray(result) || !result.every(item => "timestamp" in item && "value" in item)) {
        throw new Error("Unexpected response format from compression endpoint");
      }

      if (result.length === 0) {
        setError("No data points remained after compression. Try adjusting the parameters.");
        setCompressedData([]);
        setCompressedLabels([]);
      } else {
        const rawDataForChart = rawData
          .map((value, index) => {
            const parsedTime = parseTimestamp(labels[index], index);
            if (!parsedTime) return null;
            return {
              time: parsedTime,
              value: value,
            };
          })
          .filter(item => item !== null)
          .sort((a, b) => a.time - b.time);

        const compressedDataForChart = result
          .map((item, index) => {
            const parsedTime = parseTimestamp(item.timestamp, index);
            if (!parsedTime) return null;
            return {
              time: parsedTime,
              value: item.value,
            };
          })
          .filter(item => item !== null)
          .sort((a, b) => a.time - b.time);

        setCompressedData(compressedDataForChart.map(item => item.value));
        setCompressedLabels(compressedDataForChart.map(item => item.time.toISOString()));
      }
    } catch (err) {
      console.error("Error compressing data with Azure Function:", err);
      setError(`Failed to compress data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rawDataForChart = rawData
    .map((value, index) => {
      const parsedTime = parseTimestamp(labels[index], index);
      if (!parsedTime) return null;
      return {
        time: parsedTime,
        value: value,
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => a.time - b.time);

  const compressedDataForChart = compressedData
    .map((value, index) => {
      const parsedTime = parseTimestamp(compressedLabels[index], index);
      if (!parsedTime) return null;
      return {
        time: parsedTime,
        value: value,
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => a.time - b.time);

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
          setLabels={(newLabels) => {
            console.log("Setting labels from ConfigPanel:", newLabels);
            setLabels(newLabels);
          }}
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
          rawData={rawDataForChart.map(item => item.value)}
          labels={rawDataForChart.map(item => item.time.toISOString())}
          compressedData={compressedDataForChart.map(item => item.value)}
          compressedLabels={compressedDataForChart.map(item => item.time.toISOString())}
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
