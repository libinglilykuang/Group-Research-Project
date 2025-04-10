import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { format, isToday, isYesterday, isValid } from "date-fns";
import { TableClient, AzureSASCredential } from "@azure/data-tables";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const accountName = "team6ipstorageaccount";
const sasToken = "?sv=2017-07-29&ss=t&srt=so&sp=rwdlacu&se=2026-01-01T00:00:00Z&st=2025-01-01T00:00:00Z&spr=https&sig=wK7MJiU907XljD3qFOQ0H4KJOL9pYYL8CteWYq5Rhfc%3D";
const tableClient = new TableClient(
  `https://${accountName}.table.core.windows.net`,
  "ipconfigurations",
  new AzureSASCredential(sasToken)
);

const groupByDate = (configs) => {
  return configs.reduce((acc, config) => {
    const date = new Date(config.date);
    if (!isValid(date)) {
      console.warn(`Invalid date for config: ${config.name}`, config.date);
      return acc;
    }
    let label = format(date, "yyyy-MM-dd");
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    acc[label] = acc[label] || [];
    acc[label].push(config);
    return acc;
  }, {});
};

const CompressionSidebarPanel = ({
  configurations = [],
  setConfigurations,
  onNewConfig,
  isOpen,
  toggleSidebar,
  onLoadConfig,
  compressedData,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [editedConfig, setEditedConfig] = useState(null);
  const [selectedParameters, setSelectedParameters] = useState({});
  const menuRef = useRef(null);

  const filteredConfigurations = useMemo(() =>
    groupByDate(
      configurations.filter((config) =>
        config.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    ),
    [configurations, searchInput]
  );

  const handleDelete = useCallback(async (configId) => {
    try {
      await tableClient.deleteEntity("configurations", configId);
      setConfigurations((prevConfigs) =>
        prevConfigs.filter((config) => config.id !== configId)
      );
      alert("Configuration deleted successfully!");
    } catch (error) {
      console.error("Error deleting configuration:", error);
      alert(`Failed to delete configuration: ${error.message}`);
    }
  }, [setConfigurations]);

  const handleDownload = (config) => {
    setSelectedConfig(config);
    setDownloadModalOpen(true);
  };

  const handleParameterSelection = (paramName, isChecked) => {
    setSelectedParameters((prev) => ({
      ...prev,
      [paramName]: isChecked,
    }));
  };

  const handleConfirmDownload = () => {
    if (!selectedConfig) return;

    const zip = new JSZip();

    if (compressedData) {
      const compressedDataBlob = new Blob([JSON.stringify(compressedData, null, 2)], {
        type: "application/json",
      });
      zip.file("compressed-data.json", compressedDataBlob);
    }

    const paramsToDownload = {
      deviationLimit: selectedConfig.parameters.deviationLimit,
      deviationType: selectedConfig.parameters.deviationType,
      callbackFilter: selectedConfig.parameters.callbackFilter,
      exceptionFilter1: selectedConfig.parameters.exceptionFilter1,
      exceptionFilter2: selectedConfig.parameters.exceptionFilter2,
      minResampleLimit: selectedConfig.parameters.minResampleLimit,
      maxResampleLimit: selectedConfig.parameters.maxResampleLimit,
    };

    const paramsBlob = new Blob([JSON.stringify(paramsToDownload, null, 2)], {
      type: "application/json",
    });
    zip.file("parameters.json", paramsBlob);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${selectedConfig.name}-download.zip`);
      setDownloadModalOpen(false);
      alert("Download started!");
    });
  };

  const handleCancelDownload = () => {
    setDownloadModalOpen(false);
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setEditedConfig({
      ...config,
      parameters: {
        deviationLimit: config.parameters.deviationLimit || 2,
        deviationType: config.parameters.deviationType || "percentage",
        callbackFilter: config.parameters.callbackFilter || 0,
        exceptionFilter1: config.parameters.exceptionFilter1 || "",
        exceptionFilter2: config.parameters.exceptionFilter2 || "",
        minResampleLimit: config.parameters.minResampleLimit || 0,
        maxResampleLimit: config.parameters.maxResampleLimit || 5,
      },
    });
    setModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedEntity = {
        partitionKey: "configurations",
        rowKey: selectedConfig.id,
        name: editedConfig.name,
        date: editedConfig.date,
        parameters: JSON.stringify(editedConfig.parameters),
      };
      await tableClient.updateEntity(updatedEntity, "Merge");
      setConfigurations((prevConfigs) =>
        prevConfigs.map((config) =>
          config.id === selectedConfig.id ? { ...editedConfig, id: selectedConfig.id } : config
        )
      );
      setModalOpen(false);
      alert("Configuration updated successfully!");
    } catch (error) {
      console.error("Error updating configuration:", error);
      alert("Failed to update configuration. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setModalOpen(false);
  };

  const handleNameChange = (e) => {
    setEditedConfig((prevConfig) => ({
      ...prevConfig,
      name: e.target.value,
    }));
  };

  const handleParamChange = (paramName, value) => {
    setEditedConfig((prevConfig) => ({
      ...prevConfig,
      parameters: {
        ...prevConfig.parameters,
        [paramName]: value,
      },
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest('button[data-action="edit"]') &&
        !event.target.closest('button[data-action="download"]') &&
        !event.target.closest('button[data-action="delete"]')
      ) {
        setActiveMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: isOpen ? 0 : "-250px",
        width: "250px",
        height: "100%",
        backgroundColor: "#f8f9fa",
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        transition: "left 0.3s ease",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <button
        onClick={toggleSidebar}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        {isOpen ? "×" : "≡"}
      </button>
      <h3 style={{ marginTop: "0", color: "#333" }}>Configurations</h3>
      <button
        onClick={onNewConfig}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        New Configuration
      </button>
      <input
        type="text"
        placeholder="Search configurations..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
      {Object.entries(filteredConfigurations).map(([date, configs]) => (
        <div key={date}>
          <h4 style={{ color: "#666" }}>{date}</h4>
          {configs.map((config, index) => (
            <div
              key={config.id}
              style={{
                padding: "10px",
                backgroundColor: "#fff",
                marginBottom: "10px",
                borderRadius: "5px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <span
                onClick={() => onLoadConfig(config)}
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                {config.name}
              </span>
              <button
                onClick={() => setActiveMenuIndex(activeMenuIndex === index ? null : index)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ⋮
              </button>
              {activeMenuIndex === index && (
                <div
                  ref={menuRef}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "30px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    borderRadius: "5px",
                    zIndex: 10,
                  }}
                >
                  <button
                    data-action="edit"
                    onClick={() => handleEdit(config)}
                    style={{ display: "block", padding: "5px 10px", border: "none", background: "none", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    data-action="download"
                    onClick={() => handleDownload(config)}
                    style={{ display: "block", padding: "5px 10px", border: "none", background: "none", cursor: "pointer" }}
                  >
                    Download
                  </button>
                  <button
                    data-action="delete"
                    onClick={() => handleDelete(config.id)}
                    style={{ display: "block", padding: "5px 10px", border: "none", background: "none", cursor: "pointer", color: "red" }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "5px",
              width: "400px",
            }}
          >
            <h3>Edit Configuration</h3>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Name:
              <input
                type="text"
                value={editedConfig.name}
                onChange={handleNameChange}
                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Deviation Limit:
              <input
                type="number"
                value={editedConfig.parameters.deviationLimit}
                onChange={(e) => handleParamChange("deviationLimit", e.target.value)}
                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Deviation Type:
              <select
                value={editedConfig.parameters.deviationType}
                onChange={(e) => handleParamChange("deviationType", e.target.value)}
                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
              >
                <option value="percentage">Percentage</option>
                <option value="absolute">Absolute</option>
              </select>
            </label>
            <div style={{ marginTop: "20px" }}>
              <button onClick={handleSaveEdit} style={{ marginRight: "10px" }}>
                Save
              </button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isDownloadModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "5px",
              width: "400px",
            }}
          >
            <h3>Download Configuration</h3>
            <label style={{ display: "block", marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={selectedParameters.compressedData}
                onChange={(e) => handleParameterSelection("compressedData", e.target.checked)}
              />
              Compressed Data
            </label>
            <label style={{ display: "block", marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={selectedParameters.parameters}
                onChange={(e) => handleParameterSelection("parameters", e.target.checked)}
              />
              Parameters
            </label>
            <div style={{ marginTop: "20px" }}>
              <button onClick={handleConfirmDownload} style={{ marginRight: "10px" }}>
                Download
              </button>
              <button onClick={handleCancelDownload}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CompressionSidebarPanel.propTypes = {
  configurations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      parameters: PropTypes.object.isRequired,
    })
  ).isRequired,
  setConfigurations: PropTypes.func.isRequired,
  onNewConfig: PropTypes.func,
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  onLoadConfig: PropTypes.func.isRequired,
  compressedData: PropTypes.arrayOf(PropTypes.number),
};

export default CompressionSidebarPanel;
