import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { format, isToday, isYesterday, isValid } from "date-fns";
import { collection, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // 确保导入了 Firestore 实例

// Group by date
const groupByDate = (configs) => {
    return configs.reduce((acc, config) => {
        const date = new Date(config.date);

        // Check if the date is valid
        if (!isValid(date)) {
            console.warn(`Invalid date for config: ${config.name}`, config.date);
            return acc; // Skip invalid dates
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
                                     setConfigurations, // 接收 setConfigurations 作为 prop
                                     onNewConfig,
                                     isOpen,
                                     toggleSidebar,
                                     onLoadConfig,
                                 }) => {
    const [searchInput, setSearchInput] = useState("");
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [editedConfig, setEditedConfig] = useState(null);
    const menuRef = useRef(null);

    // 过滤配置
    const filteredConfigurations = useMemo(() => groupByDate(
        configurations.filter((config) =>
            config.name.toLowerCase().includes(searchInput.toLowerCase())
        )
    ), [configurations, searchInput]);

    // 删除配置
    const handleDelete = useCallback(async (configId) => {
        try {
            // 从 Firestore 删除
            await deleteDoc(doc(db, "configurations", configId));

            // 从本地状态中移除
            setConfigurations((prevConfigs) =>
                prevConfigs.filter((config) => config.id !== configId)
            );

            alert("Configuration deleted successfully!");
        } catch (error) {
            console.error("Error deleting configuration:", error);
            alert(`Failed to delete configuration: ${error.message}`);
        }
    }, [setConfigurations]);

    // 下载配置
    const handleDownload = (config) => {
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${config.name}.json`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
    };

    // 编辑配置
    const handleEdit = (config) => {
        setSelectedConfig(config);
        setEditedConfig({ ...config }); // 复制配置用于编辑
        setModalOpen(true);
    };

    // 保存编辑后的配置
    const handleSaveEdit = async () => {
        try {
            await updateDoc(doc(db, "configurations", selectedConfig.id), editedConfig); // 更新 Firestore
            setModalOpen(false);
            alert("Configuration updated successfully!");
        } catch (error) {
            console.error("Error updating configuration:", error);
            alert("Failed to update configuration. Please try again.");
        }
    };

    // 取消编辑
    const handleCancelEdit = () => {
        setModalOpen(false);
    };

    // 处理名称更改
    const handleNameChange = (e) => {
        setEditedConfig((prevConfig) => ({
            ...prevConfig,
            name: e.target.value,
        }));
    };

    // 处理参数更改
    const handleParamChange = (paramName, value) => {
        setEditedConfig((prevConfig) => ({
            ...prevConfig,
            parameters: {
                ...prevConfig.parameters,
                [paramName]: value,
            },
        }));
    };

    // 监听点击外部关闭菜单
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
                className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    height: "100vh",
                    width: isOpen ? "250px" : "0",
                    transition: "width 0.3s",
                    overflow: "hidden",
                    background: "#ffffff",
                    padding: isOpen ? "10px" : "0",
                    zIndex: 999,
                    color: "#333",
                    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
                }}
            >
                {isOpen && (
                    <>
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
                                ":hover": { background: "#f0f0f0" },
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
                                        <ul style={{ paddingLeft: "10px" }}>
                                            {configs.map((config) => (
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
                                                    <span>{config.name}</span>
                                                    <div style={{ position: "relative" }} ref={menuRef}>
                                                        <button
                                                            onClick={() => setActiveMenuIndex(config.id)}
                                                            style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                color: "#333",
                                                            }}
                                                        >
                                                            ...
                                                        </button>
                                                        {activeMenuIndex === config.id && (
                                                            <div
                                                                className="menu"
                                                                style={{
                                                                    position: "absolute",
                                                                    right: "-20px",
                                                                    top: "100%",
                                                                    background: "#ffffff",
                                                                    border: "1px solid #ddd",
                                                                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                                                    padding: "5px",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    zIndex: 1000,
                                                                    borderRadius: "4px",
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
                                                                        transition: "background 0.2s",
                                                                        borderRadius: "4px",
                                                                        marginBottom: "4px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        ":hover": { background: "#f0f0f0" },
                                                                    }}
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
                                                                        transition: "background 0.2s",
                                                                        borderRadius: "4px",
                                                                        marginBottom: "4px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        ":hover": { background: "#f0f0f0" },
                                                                    }}
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
                                                                        transition: "background 0.2s",
                                                                        borderRadius: "4px",
                                                                        marginBottom: "4px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        ":hover": { background: "#f0f0f0" },
                                                                    }}
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
                                                                        transition: "background 0.2s",
                                                                        borderRadius: "4px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        ":hover": { background: "#f0f0f0" },
                                                                    }}
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
                                        type="text"
                                        value={editedConfig.parameters.deviationLimit || ""}
                                        onChange={(e) => handleParamChange("deviationLimit", e.target.value)}
                                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                                    />
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <label style={{ display: "block", marginBottom: "5px" }}>Deviation Type</label>
                                    <input
                                        type="text"
                                        value={editedConfig.parameters.deviationType || ""}
                                        onChange={(e) => handleParamChange("deviationType", e.target.value)}
                                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                                    />
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
        </div>
    );
};

// Prop 类型检查
CompressionSidebarPanel.propTypes = {
    configurations: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            parameters: PropTypes.object.isRequired,
        })
    ).isRequired,
    setConfigurations: PropTypes.func.isRequired, // 添加 setConfigurations
    onNewConfig: PropTypes.func,
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    onLoadConfig: PropTypes.func.isRequired,
};

export default CompressionSidebarPanel;