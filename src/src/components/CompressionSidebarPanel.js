import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { format, isToday, isYesterday, isValid } from 'date-fns';

// Group by date
const groupByDate = (configs) => {
    return configs.reduce((acc, config) => {
        const date = new Date(config.date);

        // Check if the date is valid
        if (!isValid(date)) {
            console.warn(`Invalid date for config: ${config.name}`, config.date);
            return acc; // Skip invalid dates
        }

        let label = format(date, 'yyyy-MM-dd');
        if (isToday(date)) label = 'Today';
        else if (isYesterday(date)) label = 'Yesterday';

        acc[label] = acc[label] || [];
        acc[label].push(config);
        return acc;
    }, {});
};

const CompressionSidebarPanel = ({ configurations = [], onNewConfig, isOpen, toggleSidebar, onLoadConfig }) => {
    const [searchInput, setSearchInput] = useState('');
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const [configurationsState, setConfigurationsState] = useState(configurations);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [editedConfig, setEditedConfig] = useState(null);
    const menuRef = useRef(null);

    // Update configurationsState when the configurations prop changes
    useEffect(() => {
        setConfigurationsState(configurations);
    }, [configurations]);

    // Handle creating a new configuration
    const handleNewConfig = () => {
        if (onNewConfig) {
            onNewConfig(); // Call the callback function passed from the parent component
        }
    };

    // Filter configurations
    const filteredConfigurations = useMemo(() => groupByDate(
        configurationsState.filter((config) =>
            config.name.toLowerCase().includes(searchInput.toLowerCase())
        )
    ), [configurationsState, searchInput]);

    // Delete a configuration
    const handleDelete = useCallback((configName) => {
        setConfigurationsState((prevConfigs) => {
            const newConfigs = prevConfigs.filter((config) => config.name !== configName);
            return newConfigs;
        });
        setActiveMenuIndex(null);
    }, []);

    // Download a configuration
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

    // Toggle the menu
    const handleMenuToggle = (configName) => {
        setActiveMenuIndex(activeMenuIndex === configName ? null : configName);
    };

    // Close the menu when clicking outside
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

    // Edit a configuration
    const handleEdit = (configName, index) => {
        const config = configurationsState.find((cfg) => cfg.name === configName);
        setSelectedConfig(config);
        setEditedConfig({ ...config }); // Copy the configuration for editing
        setModalOpen(true);
    };

    // Save the edited configuration
    const handleSaveEdit = () => {
        setConfigurationsState((prevConfigs) => {
            const updatedConfigs = prevConfigs.map((config) =>
                config.name === selectedConfig.name ? editedConfig : config
            );
            return updatedConfigs;
        });
        setModalOpen(false);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setModalOpen(false);
    };

    // Handle name change
    const handleNameChange = (e) => {
        setEditedConfig((prevConfig) => ({
            ...prevConfig,
            name: e.target.value,
        }));
    };

    // Handle parameter change
    const handleParamChange = (paramName, value) => {
        setEditedConfig((prevConfig) => ({
            ...prevConfig,
            parameters: {
                ...prevConfig.parameters,
                [paramName]: value,
            },
        }));
    };

    // Load a configuration
    const handleLoadConfig = (config) => {
        if (onLoadConfig) {
            onLoadConfig(config); // Call the callback function passed from the parent component
        }
    };

    // Listen for clicks outside the menu
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div>
            {/* Sidebar toggle button */}
            {!isOpen && (
                <button
                    onClick={toggleSidebar}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'fixed', top: '10px', left: '10px', zIndex: 1000 }}
                >
                    <img src="/icons/open-sidebar.png" alt="Menu" style={{ width: '30px', height: '30px' }} />
                </button>
            )}
            <div
                className={`sidebar ${isOpen ? 'expanded' : 'collapsed'}`}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    width: isOpen ? '250px' : '0',
                    transition: 'width 0.3s',
                    overflow: 'hidden',
                    background: '#ffffff', // Pure white background
                    padding: isOpen ? '10px' : '0',
                    zIndex: 999,
                    color: '#333', // Dark text
                    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)', // Light shadow
                }}
            >
                {isOpen && (
                    <button
                        onClick={toggleSidebar}
                        style={{ position: 'absolute', right: 10, top: 10, background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        <img
                            src="/icons/close.png"
                            alt="Close"
                            style={{ width: '36px', height: '36px' }}
                        />
                    </button>
                )}
                {/* Search bar */}
                <div className="search-bar" style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="Search configurations"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{ width: 'calc(100% - 60px)', padding: '6px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', background: '#f0f0f0', color: '#333' }} // Search bar styling
                    />
                </div>
                <div className="sidebar-content">
                    {/* Button to start a new configuration */}
                    <button
                        onClick={handleNewConfig}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            marginBottom: '15px',
                            padding: '5px',
                            width: '100%',
                            textAlign: 'left',
                            color: '#333', // Dark text
                            transition: 'background 0.2s', // Hover transition effect
                            ':hover': { background: '#f0f0f0' }, // Hover background color
                        }}
                    >
                        <img
                            src="/icons/start-new-config.png"
                            alt="New Config"
                            style={{ width: '20px', height: '20px', marginRight: '10px' }}
                        />
                        <span>Start New Configuration</span>
                    </button>

                    {/* Configuration list */}
                    {Object.keys(filteredConfigurations).length > 0 ? (
                        <div>
                            {Object.entries(filteredConfigurations).map(([dateLabel, configs]) => (
                                <div key={dateLabel}>
                                    <h4 style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{dateLabel}</h4> {/* Dark text */}
                                    <ul style={{ paddingLeft: '10px' }}>
                                        {configs.map((config, index) => (
                                            <li key={config.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', color: '#333' }}> {/* Dark text */}
                                                <span>{config.name}</span> {/* Display the updated name */}
                                                <div style={{ position: 'relative' }} ref={menuRef}>
                                                    <button onClick={() => handleMenuToggle(config.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#333' }}> {/* Dark text */}
                                                        ...
                                                    </button>
                                                    {activeMenuIndex === config.name && (
                                                        <div
                                                            className="menu"
                                                            style={{
                                                                position: 'absolute',
                                                                right: '-20px', // Offset 20px to the right, outside the sidebar boundary
                                                                top: '100%',
                                                                background: '#ffffff', // White background
                                                                border: '1px solid #ddd', // Add border
                                                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Add shadow
                                                                padding: '5px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                zIndex: 1000, // Ensure the menu is above the sidebar
                                                                borderRadius: '4px', // Rounded corners
                                                            }}
                                                        >
                                                            <button
                                                                data-action="edit"
                                                                onClick={() => handleEdit(config.name, index)}
                                                                style={{
                                                                    background: '#ffffff', // White background
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#333', // Dark text
                                                                    padding: '8px 12px', // Increase padding
                                                                    textAlign: 'left',
                                                                    transition: 'background 0.2s', // Hover transition effect
                                                                    borderRadius: '4px', // Rounded corners
                                                                    marginBottom: '4px', // Button spacing
                                                                    display: 'flex', // Use flex layout
                                                                    alignItems: 'center', // Vertically center
                                                                    ':hover': { background: '#f0f0f0' }, // Hover background color
                                                                }}
                                                            >
                                                                <img
                                                                    src="/icons/edit.png"
                                                                    alt="Edit"
                                                                    style={{ width: '16px', height: '16px', marginRight: '8px' }} // Icon styling
                                                                />
                                                                Edit
                                                            </button>
                                                            <button
                                                                data-action="download"
                                                                onClick={() => handleDownload(config.name)}
                                                                style={{
                                                                    background: '#ffffff', // White background
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#333', // Dark text
                                                                    padding: '8px 12px', // Increase padding
                                                                    textAlign: 'left',
                                                                    transition: 'background 0.2s', // Hover transition effect
                                                                    borderRadius: '4px', // Rounded corners
                                                                    marginBottom: '4px', // Button spacing
                                                                    display: 'flex', // Use flex layout
                                                                    alignItems: 'center', // Vertically center
                                                                    ':hover': { background: '#f0f0f0' }, // Hover background color
                                                                }}
                                                            >
                                                                <img
                                                                    src="/icons/download.png"
                                                                    alt="Download"
                                                                    style={{ width: '16px', height: '16px', marginRight: '8px' }} // Icon styling
                                                                />
                                                                Download
                                                            </button>
                                                            <button
                                                                data-action="delete"
                                                                onClick={() => handleDelete(config.name)}
                                                                style={{
                                                                    background: '#ffffff', // White background
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#333', // Dark text
                                                                    padding: '8px 12px', // Increase padding
                                                                    textAlign: 'left',
                                                                    transition: 'background 0.2s', // Hover transition effect
                                                                    borderRadius: '4px', // Rounded corners
                                                                    marginBottom: '4px', // Button spacing
                                                                    display: 'flex', // Use flex layout
                                                                    alignItems: 'center', // Vertically center
                                                                    ':hover': { background: '#f0f0f0' }, // Hover background color
                                                                }}
                                                            >
                                                                <img
                                                                    src="/icons/delete.png"
                                                                    alt="Delete"
                                                                    style={{ width: '16px', height: '16px', marginRight: '8px' }} // Icon styling
                                                                />
                                                                Delete
                                                            </button>
                                                            <button
                                                                data-action="load"
                                                                onClick={() => handleLoadConfig(config)}
                                                                style={{
                                                                    background: '#ffffff', // White background
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#333', // Dark text
                                                                    padding: '8px 12px', // Increase padding
                                                                    textAlign: 'left',
                                                                    transition: 'background 0.2s', // Hover transition effect
                                                                    borderRadius: '4px', // Rounded corners
                                                                    display: 'flex', // Use flex layout
                                                                    alignItems: 'center', // Vertically center
                                                                    ':hover': { background: '#f0f0f0' }, // Hover background color
                                                                }}
                                                            >
                                                                <img
                                                                    src="/icons/load.png"
                                                                    alt="Load"
                                                                    style={{ width: '16px', height: '16px', marginRight: '8px' }} // Icon styling
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
                        <div style={{ color: 'gray', fontStyle: 'italic' }}>No configurations available</div>
                    )}
                </div>
            </div>

            {/* Edit modal */}
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
                    onClick={handleCancelEdit}
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '400px',
                            maxHeight: '80vh',
                            boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleCancelEdit}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '10px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <img
                                src="/icons/cancel.png"
                                alt="Close"
                                style={{ width: '24px', height: '24px' }}
                            />
                        </button>

                        <h3>Edit Configuration</h3>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                                <input
                                    type="text"
                                    value={editedConfig.name}
                                    onChange={handleNameChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
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
                        </div>

                        {/* Save button with improved styling */}
                        <div style={{ marginTop: '10px', textAlign: 'left' }}>
                            <button
                                onClick={handleSaveEdit}
                                style={{
                                    background: '#007BFF',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 15px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    transition: 'background 0.3s ease',
                                }}
                                onMouseOver={(e) => e.target.style.background = '#0056b3'}
                                onMouseOut={(e) => e.target.style.background = '#007BFF'}
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

CompressionSidebarPanel.propTypes = {
    configurations: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            parameters: PropTypes.object.isRequired,
        })
    ),
    onNewConfig: PropTypes.func,
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    onLoadConfig: PropTypes.func.isRequired,
};

export default CompressionSidebarPanel;