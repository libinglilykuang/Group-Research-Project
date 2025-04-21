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
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const menuRef = useRef(null);

  // 处理鼠标按下开始调整大小
  const startResizing = useCallback((e) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  // 处理鼠标移动调整大小
  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = startWidthRef.current + e.clientX - startXRef.current;
      // 限制最小和最大宽度
      setSidebarWidth(Math.max(150, Math.min(newWidth, 500)));
    }
  }, [isResizing]);

  // 处理鼠标释放停止调整大小
  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

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
          !event.target.closest('button[data-action="delete"]') &&
          !event.target.closest('button[data-action="load"]')
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
      <div>
        {/* Sidebar toggle button */}
        {!isOpen && (
            <button
                onClick={toggleSidebar}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  position: "fixed",
                  top: "10px",
                  left: "10px",
                  zIndex: 1000,
                }}
            >
              <img src="/icons/open-sidebar.png" alt="Menu" style={{ width: "30px", height: "30px" }} />
            </button>
        )}

        {/* Sidebar content */}
        <div
            ref={sidebarRef}
            className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              height: "100vh",
              width: isOpen ? `${sidebarWidth}px` : "0",
              transition: isResizing ? "none" : "width 0.3s",
              overflowY: "auto",
              overflowX: "hidden",
              background: "#ffffff",
              padding: isOpen ? "10px" : "0",
              zIndex: 999,
              color: "#333",
              boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
            }}
        >
          {isOpen && (
              <>
                <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "8px",
                      cursor: "col-resize",
                      backgroundColor: isResizing ? "rgba(0, 123, 255, 0.5)" : "transparent",
                      zIndex: 1000,
                    }}
                    onMouseDown={startResizing}
                />

                {/* Close button */}
                <button
                    onClick={toggleSidebar}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: 10,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                >
                  <img src="/icons/close.png" alt="Close" style={{ width: "36px", height: "36px" }} />
                </button>

                {/* Search bar */}
                <div className="search-bar" style={{ marginBottom: "15px" }}>
                  <input
                      type="text"
                      placeholder="Search configurations"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      style={{
                        width: "calc(100% - 60px)",
                        padding: "6px",
                        fontSize: "14px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        background: "#f0f0f0",
                        color: "#333",
                      }}
                  />
                </div>

                {/* New configuration button */}
                <button
                    onClick={onNewConfig}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      marginBottom: "15px",
                      padding: "5px",
                      width: "100%",
                      textAlign: "left",
                      color: "#333",
                      transition: "background 0.2s",
                    }}
                >
                  <img
                      src="/icons/start-new-config.png"
                      alt="New Config"
                      style={{ width: "20px", height: "20px", marginRight: "10px" }}
                  />
                  <span>Start New Configuration</span>
                </button>

                {/* Configuration list */}
                {Object.keys(filteredConfigurations).length > 0 ? (
                    <div>
                      {Object.entries(filteredConfigurations).map(([dateLabel, configs]) => (
                          <div key={dateLabel}>
                            <h4 style={{ marginTop: "10px", fontWeight: "bold", fontSize: "16px", color: "#333" }}>
                              {dateLabel}
                            </h4>
                            <ul style={{ paddingLeft: "10px", listStyle: "none" }}>
                              {configs.map((config, index) => (
                                  <li
                                      key={config.id}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "5px 0",
                                        color: "#333",
                                      }}
                                  >
                          <span onClick={() => onLoadConfig(config)} style={{ cursor: "pointer" }}>
                            {config.name}
                          </span>
                                    <div style={{ position: "relative" }} ref={menuRef}>
                                      <button
                                          onClick={() => setActiveMenuIndex(activeMenuIndex === config.id ? null : config.id)}
                                          style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#333",
                                            fontSize: "16px",
                                            padding: "0 5px",
                                          }}
                                      >
                                        ...
                                      </button>
                                      {activeMenuIndex === config.id && (
                                          <div
                                              className="menu"
                                              style={{
                                                position: "absolute",
                                                right: "0",
                                                top: "100%",
                                                background: "#ffffff",
                                                border: "1px solid #ddd",
                                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                                padding: "5px",
                                                display: "flex",
                                                flexDirection: "column",
                                                zIndex: 1000,
                                                borderRadius: "4px",
                                                minWidth: "120px",
                                              }}
                                          >
                                            <button
                                                data-action="edit"
                                                onClick={() => handleEdit(config)}
                                                style={{
                                                  background: "#ffffff",
                                                  border: "none",
                                                  cursor: "pointer",
                                                  color: "#333",
                                                  padding: "8px 12px",
                                                  textAlign: "left",
                                                  borderRadius: "4px",
                                                  marginBottom: "4px",
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                                onMouseOver={(e) => (e.target.style.background = "#f0f0f0")}
                                                onMouseOut={(e) => (e.target.style.background = "#ffffff")}
                                            >
                                              <img
                                                  src="/icons/edit.png"
                                                  alt="Edit"
                                                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                                              />
                                              Edit
                                            </button>
                                            <button
                                                data-action="download"
                                                onClick={() => handleDownload(config)}
                                                style={{
                                                  background: "#ffffff",
                                                  border: "none",
                                                  cursor: "pointer",
                                                  color: "#333",
                                                  padding: "8px 12px",
                                                  textAlign: "left",
                                                  borderRadius: "4px",
                                                  marginBottom: "4px",
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                                onMouseOver={(e) => (e.target.style.background = "#f0f0f0")}
                                                onMouseOut={(e) => (e.target.style.background = "#ffffff")}
                                            >
                                              <img
                                                  src="/icons/download.png"
                                                  alt="Download"
                                                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                                              />
                                              Download
                                            </button>
                                            <button
                                                data-action="delete"
                                                onClick={() => handleDelete(config.id)}
                                                style={{
                                                  background: "#ffffff",
                                                  border: "none",
                                                  cursor: "pointer",
                                                  color: "#333",
                                                  padding: "8px 12px",
                                                  textAlign: "left",
                                                  borderRadius: "4px",
                                                  marginBottom: "4px",
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                                onMouseOver={(e) => (e.target.style.background = "#f0f0f0")}
                                                onMouseOut={(e) => (e.target.style.background = "#ffffff")}
                                            >
                                              <img
                                                  src="/icons/delete.png"
                                                  alt="Delete"
                                                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                                              />
                                              Delete
                                            </button>
                                            <button
                                                data-action="load"
                                                onClick={() => onLoadConfig(config)}
                                                style={{
                                                  background: "#ffffff",
                                                  border: "none",
                                                  cursor: "pointer",
                                                  color: "#333",
                                                  padding: "8px 12px",
                                                  textAlign: "left",
                                                  borderRadius: "4px",
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                                onMouseOver={(e) => (e.target.style.background = "#f0f0f0")}
                                                onMouseOut={(e) => (e.target.style.background = "#ffffff")}
                                            >
                                              <img
                                                  src="/icons/load.png"
                                                  alt="Load"
                                                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                                              />
                                              Load
                                            </button>
                                          </div>
                                      )}
                                    </div>
                                  </li>
                              ))}
                            </ul>
                          </div>
                      ))}
                    </div>
                ) : (
                    <div style={{ color: "gray", fontStyle: "italic" }}>No configurations available</div>
                )}
              </>
          )}
        </div>

        {/* Resizing overlay */}
        {isResizing && (
            <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  cursor: "col-resize",
                }}
            />
        )}

        {/* Edit modal */}
        {isModalOpen && selectedConfig && (
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
                  zIndex: 1000,
                }}
                onClick={handleCancelEdit}
            >
              <div
                  style={{
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "400px",
                    maxHeight: "80vh",
                    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                  onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                    onClick={handleCancelEdit}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "10px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                >
                  <img src="/icons/cancel.png" alt="Close" style={{ width: "24px", height: "24px" }} />
                </button>

                <h3>Edit Configuration</h3>
                <div style={{ overflowY: "auto", flex: 1 }}>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>Name</label>
                    <input
                        type="text"
                        value={editedConfig.name}
                        onChange={handleNameChange}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                  <p>
                    <strong>Date:</strong> {format(new Date(selectedConfig.date), "yyyy-MM-dd HH:mm")}
                  </p>
                  <h4>Parameters:</h4>
                  <form>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px" }}>Deviation Limit</label>
                      <input
                          type="number"
                          value={editedConfig.parameters.deviationLimit}
                          onChange={(e) => handleParamChange("deviationLimit", e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px" }}>Deviation Type</label>
                      <select
                          value={editedConfig.parameters.deviationType}
                          onChange={(e) => handleParamChange("deviationType", e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="absolute">Absolute</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px" }}>Callback Filter</label>
                      <input
                          type="text"
                          value={editedConfig.parameters.callbackFilter || ""}
                          onChange={(e) => handleParamChange("callbackFilter", e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px" }}>Exception Filter 1</label>
                      <input
                          type="text"
                          value={editedConfig.parameters.exceptionFilter1 || ""}
                          onChange={(e) => handleParamChange("exceptionFilter1", e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px" }}>Exception Filter 2</label>
                      <input
                          type="text"
                          value={editedConfig.parameters.exceptionFilter2 || ""}
                          onChange={(e) => handleParamChange("exceptionFilter2", e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px" }}>Min Resample Limit</label>
                      <input
                          type="text"
                          value={editedConfig.parameters.minResampleLimit || ""}
                          onChange={(e) => handleParamChange("minResampleLimit", e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px" }}>Max Resample Limit</label>
                      <input
                          type="text"
                          value={editedConfig.parameters.maxResampleLimit || ""}
                          onChange={(e) => handleParamChange("maxResampleLimit", e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                  </form>
                </div>

                {/* Save button */}
                <div style={{ marginTop: "10px", textAlign: "left" }}>
                  <button
                      onClick={handleSaveEdit}
                      style={{
                        background: "#007BFF",
                        color: "white",
                        border: "none",
                        padding: "10px 15px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        transition: "background 0.3s ease",
                      }}
                      onMouseOver={(e) => (e.target.style.background = "#0056b3")}
                      onMouseOut={(e) => (e.target.style.background = "#007BFF")}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Download modal */}
        {isDownloadModalOpen && selectedConfig && (
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
                  zIndex: 1000,
                }}
                onClick={handleCancelDownload}
            >
              <div
                  style={{
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "400px",
                    maxHeight: "80vh",
                    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                  onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                    onClick={handleCancelDownload}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "10px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                >
                  <img src="/icons/cancel.png" alt="Close" style={{ width: "24px", height: "24px" }} />
                </button>

                <h3>Download Configuration</h3>
                <div style={{ overflowY: "auto", flex: 1 }}>
                  <p>Select parameters to include in the download:</p>
                  {[
                    "deviationLimit",
                    "deviationType",
                    "callbackFilter",
                    "exceptionFilter1",
                    "exceptionFilter2",
                    "minResampleLimit",
                    "maxResampleLimit",
                  ].map((param) => (
                      <div key={param} style={{ marginBottom: "10px" }}>
                        <label>
                          <input
                              type="checkbox"
                              checked={selectedParameters[param] || false}
                              onChange={(e) => handleParameterSelection(param, e.target.checked)}
                          />
                          {param}
                        </label>
                      </div>
                  ))}
                </div>

                {/* Confirm button */}
                <div style={{ marginTop: "10px", textAlign: "left" }}>
                  <button
                      onClick={handleConfirmDownload}
                      style={{
                        background: "#007BFF",
                        color: "white",
                        border: "none",
                        padding: "10px 15px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        transition: "background 0.3s ease",
                      }}
                      onMouseOver={(e) => (e.target.style.background = "#0056b3")}
                      onMouseOut={(e) => (e.target.style.background = "#007BFF")}
                  >
                    Confirm Download
                  </button>
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