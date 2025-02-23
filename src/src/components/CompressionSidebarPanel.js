import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

const CompressionSidebarPanel = ({ configurations = [], onNewConfig, isOpen, toggleSidebar, onLoadConfig }) => {
    const [searchInput, setSearchInput] = useState('');
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const [configurationsState, setConfigurationsState] = useState(configurations);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [editedConfig, setEditedConfig] = useState(null);
    const menuRef = useRef(null);

    // 当 configurations 属性变化时，更新 configurationsState
    useEffect(() => {
        setConfigurationsState(configurations);
    }, [configurations]);

    // 处理开启新配置
    const handleNewConfig = () => {
        if (onNewConfig) {
            onNewConfig(); // 调用父组件传递的回调函数
        }
    };

    // 过滤配置
    const filteredConfigurations = useMemo(() => groupByDate(
        configurationsState.filter((config) =>
            config.name.toLowerCase().includes(searchInput.toLowerCase())
        )
    ), [configurationsState, searchInput]);

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
            !event.target.closest('button[data-action="edit"]') &&
            !event.target.closest('button[data-action="download"]') &&
            !event.target.closest('button[data-action="delete"]')
        ) {
            setActiveMenuIndex(null);
        }
    };

    // 编辑配置
    const handleEdit = (configName, index) => {
        const config = configurationsState.find((cfg) => cfg.name === configName);
        setSelectedConfig(config);
        setEditedConfig({ ...config }); // 复制配置以进行编辑
        setModalOpen(true);
    };

    // 保存编辑
    const handleSaveEdit = () => {
        setConfigurationsState((prevConfigs) => {
            const updatedConfigs = prevConfigs.map((config) =>
                config.name === selectedConfig.name ? editedConfig : config
            );
            return updatedConfigs;
        });
        setModalOpen(false);
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

    // 加载配置
    const handleLoadConfig = (config) => {
        if (onLoadConfig) {
            onLoadConfig(config); // 调用父组件传递的回调函数
        }
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
                    background: '#ffffff', // 纯白色背景
                    padding: isOpen ? '10px' : '0',
                    zIndex: 999,
                    color: '#333', // 深色文字
                    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)', // 浅色阴影
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
                {/* 搜索栏 */}
                <div className="search-bar" style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="Search configurations"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{ width: 'calc(100% - 60px)', padding: '6px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', background: '#f0f0f0', color: '#333' }} // 搜索栏样式
                    />
                </div>
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
                            color: '#333', // 深色文字
                            transition: 'background 0.2s', // 悬停过渡效果
                            ':hover': { background: '#f0f0f0' }, // 悬停背景颜色
                        }}
                    >
                        <img
                            src="/icons/start-new-config.png"
                            alt="New Config"
                            style={{ width: '20px', height: '20px', marginRight: '10px' }}
                        />
                        <span>Start New Configuration</span>
                    </button>

                    {/* 配置列表 */}
                    {Object.keys(filteredConfigurations).length > 0 ? (
                        <div>
                            {Object.entries(filteredConfigurations).map(([dateLabel, configs]) => (
                                <div key={dateLabel}>
                                    <h4 style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{dateLabel}</h4> {/* 深色文字 */}
                                    <ul style={{ paddingLeft: '10px' }}>
                                        {configs.map((config, index) => (
                                            <li key={config.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', color: '#333' }}> {/* 深色文字 */}
                                                <span>{config.name}</span> {/* 显示更新后的名称 */}
                                                <div style={{ position: 'relative' }} ref={menuRef}>
                                                    <button onClick={() => handleMenuToggle(config.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#333' }}> {/* 深色文字 */}
                                                        ...
                                                    </button>
                                                    {activeMenuIndex === config.name && (
                                                        <div
                                                            className="menu"
                                                            style={{
                                                                position: 'absolute',
                                                                right: '-20px', // 向右偏移 20px，超出侧边栏边界
                                                                top: '100%',
                                                                background: '#ffffff', // 白色背景
                                                                border: '1px solid #ddd', // 添加边框
                                                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影
                                                                padding: '5px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                zIndex: 1000, // 确保菜单在侧边栏上方
                                                                borderRadius: '4px', // 圆角
                                                            }}
                                                        >
                                                            <button
                                                                data-action="edit"
                                                                onClick={() => handleEdit(config.name, index)}
                                                                style={{
                                                                    background: '#ffffff', // 白色背景
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#333', // 深色文字
                                                                    padding: '8px 12px', // 增加内边距
                                                                    textAlign: 'left',
                                                                    transition: 'background 0.2s', // 悬停过渡效果
                                                                    borderRadius: '4px', // 圆角
                                                                    marginBottom: '4px', // 按钮间距
                                                                    display: 'flex', // 使用 flex 布局
                                                                    alignItems: 'center', // 垂直居中
                                                                    ':hover': { background: '#f0f0f0' }, // 悬停背景颜色
                                                                }}
                                                            >
                                                                <img
                                                                    src="/icons/edit.png"
                                                                    alt="Edit"
                                                                    style={{ width: '16px', height: '16px', marginRight: '8px' }} // 图标样式
                                                                />
                                                                Edit
                                                            </button>
                                                            <button
                                                                data-action="download"
                                                                onClick={() => handleDownload(config.name)}
                                                                style={{
                                                                    background: '#ffffff', // 白色背景
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#333', // 深色文字
                                                                    padding: '8px 12px', // 增加内边距
                                                                    textAlign: 'left',
                                                                    transition: 'background 0.2s', // 悬停过渡效果
                                                                    borderRadius: '4px', // 圆角
                                                                    marginBottom: '4px', // 按钮间距
                                                                    display: 'flex', // 使用 flex 布局
                                                                    alignItems: 'center', // 垂直居中
                                                                    ':hover': { background: '#f0f0f0' }, // 悬停背景颜色
                                                                }}
                                                            >
                                                                <img
                                                                    src="/icons/download.png"
                                                                    alt="Download"
                                                                    style={{ width: '16px', height: '16px', marginRight: '8px' }} // 图标样式
                                                                />
                                                                Download
                                                            </button>
                                                            <button
                                                                data-action="delete"
                                                                onClick={() => handleDelete(config.name)}
                                                                style={{
                                                                    background: '#ffffff', // 白色背景
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#333', // 深色文字
                                                                    padding: '8px 12px', // 增加内边距
                                                                    textAlign: 'left',
                                                                    transition: 'background 0.2s', // 悬停过渡效果
                                                                    borderRadius: '4px', // 圆角
                                                                    marginBottom: '4px', // 按钮间距
                                                                    display: 'flex', // 使用 flex 布局
                                                                    alignItems: 'center', // 垂直居中
                                                                    ':hover': { background: '#f0f0f0' }, // 悬停背景颜色
                                                                }}
                                                            >
                                                                <img
                                                                    src="/icons/delete.png"
                                                                    alt="Delete"
                                                                    style={{ width: '16px', height: '16px', marginRight: '8px' }} // 图标样式
                                                                />
                                                                Delete
                                                            </button>
                                                            <button
                                                                data-action="load"
                                                                onClick={() => handleLoadConfig(config)}
                                                                style={{
                                                                    background: '#ffffff', // 白色背景
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#333', // 深色文字
                                                                    padding: '8px 12px', // 增加内边距
                                                                    textAlign: 'left',
                                                                    transition: 'background 0.2s', // 悬停过渡效果
                                                                    borderRadius: '4px', // 圆角
                                                                    display: 'flex', // 使用 flex 布局
                                                                    alignItems: 'center', // 垂直居中
                                                                    ':hover': { background: '#f0f0f0' }, // 悬停背景颜色
                                                                }}
                                                            >
                                                                <img
                                                                    src="/icons/load.png"
                                                                    alt="Load"
                                                                    style={{ width: '16px', height: '16px', marginRight: '8px' }} // 图标样式
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
                    onClick={handleCancelEdit}
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '400px',
                            boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Edit Configuration</h3>
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
                        <button onClick={handleSaveEdit} style={{ marginTop: '10px', marginRight: '10px' }}>Save</button>
                        <button onClick={handleCancelEdit} style={{ marginTop: '10px' }}>Cancel</button>
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