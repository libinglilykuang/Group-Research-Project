import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { format, isToday, isYesterday } from 'date-fns';

const exampleConfigurations = [
    { name: 'Config 1', date: '2025-01-30T12:00:00Z', parameters: { param1: 'value1', param2: 'value2' } },
    { name: 'Config 2', date: '2025-01-29T15:30:00Z', parameters: { param1: 'value3', param2: 'value4' } },
    { name: 'Config 3', date: '2025-01-28T09:00:00Z', parameters: { param1: 'value5', param2: 'value6' } },
    { name: 'Config 4', date: '2025-01-28T13:45:00Z', parameters: { param1: 'value7', param2: 'value8' } },
    { name: 'Config 5', date: '2025-01-27T10:00:00Z', parameters: { param1: 'value9', param2: 'value10' } }
];

// Group Data
const groupByDate = (configs) => {
    return configs.reduce((acc, config) => {
        const date = new Date(config.date);
        let label = format(date, 'yyyy-MM-dd');
        if (isToday(date)) label = 'Today';
        else if (isYesterday(date)) label = 'Yesterday';
        acc[label] = acc[label] || [];
        acc[label].push(config);
        return acc;
    }, {});
};

const CompressionSidebarPanel = ({ configurations = [] }) => {
    const [isSidebarExpanded, setSidebarExpanded] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const [configurationsState, setConfigurationsState] = useState(configurations);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [editedConfig, setEditedConfig] = useState(null);
    const [loadedConfig, setLoadedConfig] = useState(null);
    const menuRef = useRef(null);

    // Filter
    const filteredConfigurations = groupByDate(
        configurationsState.filter((config) =>
            config.name.toLowerCase().includes(searchInput.toLowerCase())
        )
    );

    // Delete
    const handleDelete = useCallback((configName) => {
        setConfigurationsState((prevConfigs) => {
            const newConfigs = prevConfigs.filter((config) => config.name !== configName);
            return newConfigs;
        });
        setActiveMenuIndex(null);
    }, []);

    // Download
    const handleDownload = (configName) => {
        const config = configurationsState.find((cfg) => cfg.name === configName);

        if (config) {
            const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${configName}.json`;
            link.click();
            URL.revokeObjectURL(downloadUrl);
        }
    };

    const handleMenuToggle = (configName) => {
        setActiveMenuIndex(activeMenuIndex === configName ? null : configName);
    };

    const handleClickOutside = (event) => {
        if (
            menuRef.current &&
            !menuRef.current.contains(event.target) &&
            !event.target.closest('button[data-action="load"]') &&
            !event.target.closest('button[data-action="edit"]') &&
            !event.target.closest('button[data-action="download"]') &&
            !event.target.closest('button[data-action="delete"]')
        ) {
            setActiveMenuIndex(null);
        }
    };

    const handleEdit = (configName) => {
        const config = configurationsState.find((cfg) => cfg.name === configName);
        setSelectedConfig(config);
        setEditedConfig({ ...config });
        setModalOpen(true);
    };

    const handleLoad = (configName) => {
        const config = configurationsState.find((cfg) => cfg.name === configName);
        setLoadedConfig(config);
        setActiveMenuIndex(null);
    };

    // Save
    const handleSave = () => {
        setConfigurationsState((prevConfigs) => {
            const updatedConfigs = prevConfigs.map((config) =>
                config.name === selectedConfig.name ? { ...config, parameters: editedConfig.parameters } : config
            );
            return updatedConfigs;
        });
        setModalOpen(false);
    };

    const handleCancel = () => {
        setModalOpen(false);
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div>
            <button onClick={() => setSidebarExpanded(true)}>Open Sidebar</button>
            <div
                className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    width: isSidebarExpanded ? '250px' : '0',
                    transition: 'width 0.3s',
                    overflow: 'hidden',
                    background: '#f4f4f4',
                    padding: isSidebarExpanded ? '10px' : '0',
                }}
            >
                {isSidebarExpanded && (
                    <button onClick={() => setSidebarExpanded(false)} style={{ position: 'absolute', right: 10, top: 10 }}>
                        ✖
                    </button>
                )}
                <div className="sidebar-content">
                    <div className="search-bar" style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="Search configurations"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ width: 'calc(100% - 20px)', padding: '6px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    {Object.keys(filteredConfigurations).length > 0 ? (
                        <div>
                            {Object.entries(filteredConfigurations).map(([dateLabel, configs]) => (
                                <div key={dateLabel}>
                                    <h4 style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{dateLabel}</h4>
                                    <ul style={{ paddingLeft: '10px' }}>
                                        {configs.map((config) => (
                                            <li key={config.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                                                <span>{config.name}</span>
                                                <div style={{ position: 'relative' }} ref={menuRef}>
                                                    <button onClick={() => handleMenuToggle(config.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                                        ...
                                                    </button>
                                                    {activeMenuIndex === config.name && (
                                                        <div
                                                            className="menu"
                                                            style={{
                                                                position: 'absolute',
                                                                right: 0,
                                                                background: '#fff',
                                                                boxShadow: '0px 0px 5px rgba(0,0,0,0.2)',
                                                                padding: '5px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                            }}
                                                        >
                                                            <button data-action="load" onClick={() => handleLoad(config.name)}>
                                                                Load
                                                            </button>
                                                            <button data-action="edit" onClick={() => handleEdit(config.name)}>
                                                                Edit
                                                            </button>
                                                            <button data-action="download" onClick={() => handleDownload(config.name)}>
                                                                Download
                                                            </button>
                                                            <button data-action="delete" onClick={() => handleDelete(config.name)}>
                                                                Delete
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
                        <div style={{ color: 'gray', fontStyle: 'italic' }}>No configurations available</div>
                    )}
                </div>
            </div>

            {loadedConfig && (
                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', margin: '20px' }}>
                    <h3>Loaded Configuration</h3>
                    <p><strong>Name:</strong> {loadedConfig.name}</p>
                    <p><strong>Date:</strong> {format(new Date(loadedConfig.date), 'yyyy-MM-dd HH:mm')}</p>
                    <h4>Parameters:</h4>
                    <ul>
                        {Object.entries(loadedConfig.parameters).map(([key, value]) => (
                            <li key={key}><strong>{key}:</strong> {value}</li>
                        ))}
                    </ul>
                </div>
            )}

            {isModalOpen && selectedConfig && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={handleCancel}
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '400px',
                            boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
                            zIndex: 1100,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Edit Configuration</h3>
                        <p><strong>Name:</strong> {selectedConfig.name}</p>
                        <p><strong>Date:</strong> {format(new Date(selectedConfig.date), 'yyyy-MM-dd HH:mm')}</p>
                        <h4>Parameters:</h4>
                        <form>
                            {Object.entries(editedConfig.parameters).map(([key, value]) => (
                                <div key={key} style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>{key}</label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleParamChange(key, e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            ))}
                        </form>
                        <button onClick={handleSave} style={{ marginTop: '10px', marginRight: '10px' }}>Save</button>
                        <button onClick={handleCancel} style={{ marginTop: '10px' }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

CompressionSidebarPanel.propTypes = {
    configurations: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            parameters: PropTypes.object.isRequired,
        })
    ),
};

export default () => <CompressionSidebarPanel configurations={exampleConfigurations} />;
