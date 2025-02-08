import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { format, isToday, isYesterday, isValid } from 'date-fns';

// 按日期分组
const groupByDate = (configs) => {
    return configs.reduce((acc, config) => {
        const date = new Date(config.date);

        // 检查日期是否有效
        if (!isValid(date)) {
            console.warn(`Invalid date for config: ${config.name}`, config.date);
            return acc; // 跳过无效日期
        }

        let label = format(date, 'yyyy-MM-dd');
        if (isToday(date)) label = 'Today';
        else if (isYesterday(date)) label = 'Yesterday';

        acc[label] = acc[label] || [];
        acc[label].push(config);
        return acc;
    }, {});
};

const CompressionSidebarPanel = ({ configurations = [], onNewConfig }) => {
    const [isSidebarExpanded, setSidebarExpanded] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const [configurationsState, setConfigurationsState] = useState(configurations);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [editedConfig, setEditedConfig] = useState(null);
    const [loadedConfig, setLoadedConfig] = useState(null);
    const menuRef = useRef(null);

    // 处理开启新配置
    const handleNewConfig = () => {
        setLoadedConfig(null); // 清除已加载的配置
        if (onNewConfig) {
            onNewConfig(); // 调用父组件传递的回调函数
        }
    };

    // 过滤配置
    const filteredConfigurations = groupByDate(
        configurationsState.filter((config) =>
            config.name.toLowerCase().includes(searchInput.toLowerCase())
        )
    );

    // 删除配置
    const handleDelete = useCallback((configName) => {
        setConfigurationsState((prevConfigs) => {
            const newConfigs = prevConfigs.filter((config) => config.name !== configName);
            return newConfigs;
        });
        setActiveMenuIndex(null);
    }, []);

    // 下载配置
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

    // 切换菜单
    const handleMenuToggle = (configName) => {
        setActiveMenuIndex(activeMenuIndex === configName ? null : configName);
    };

    // 点击外部关闭菜单
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

    // 编辑配置
    const handleEdit = (configName) => {
        const config = configurationsState.find((cfg) => cfg.name === configName);
        setSelectedConfig(config);
        setEditedConfig({ ...config });
        setModalOpen(true);
    };

    // 加载配置
    const handleLoad = (configName) => {
        const config = configurationsState.find((cfg) => cfg.name === configName);
        setLoadedConfig(config);
        setActiveMenuIndex(null);
    };

    // 保存编辑
    const handleSave = () => {
        setConfigurationsState((prevConfigs) => {
            const updatedConfigs = prevConfigs.map((config) =>
                config.name === selectedConfig.name ? { ...config, parameters: editedConfig.parameters } : config
            );
            return updatedConfigs;
        });
        setModalOpen(false);
    };

    // 取消编辑
    const handleCancel = () => {
        setModalOpen(false);
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

    // 监听外部点击
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div>
            {/* 侧边栏展开按钮 */}
            {!isSidebarExpanded && (
                <button
                    onClick={() => setSidebarExpanded(true)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'fixed', top: '10px', left: '10px', zIndex: 1000 }}
                >
                    <img src="/icons/menu-icon.png" alt="Menu" style={{ width: '30px', height: '30px' }} />
                </button>
            )}
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
                    <button
                        onClick={() => setSidebarExpanded(false)}
                        style={{ position: 'absolute', right: 10, top: 10, background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        <img
                            src="/icons/close-icon.png"
                            alt="Close"
                            style={{ width: '36px', height: '36px' }}
                        />
                    </button>
                )}
                <div className="sidebar-content">
                    {/* 开启新配置按钮 */}
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
                        }}
                    >
                        <img
                            src="/icons/new-config-icon.png"
                            alt="New Config"
                            style={{ width: '20px', height: '20px', marginRight: '10px' }}
                        />
                        <span>开启新配置</span>
                    </button>

                    {/* 搜索栏 */}
                    <div className="search-bar" style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="Search configurations"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ width: 'calc(100% - 60px)', padding: '6px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    {/* 配置列表 */}
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

            {/* 编辑模态框 */}
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
    onNewConfig: PropTypes.func,
};

export default CompressionSidebarPanel;