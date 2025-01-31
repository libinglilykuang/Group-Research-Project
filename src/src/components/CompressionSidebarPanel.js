import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { format, isToday, isYesterday } from 'date-fns';

// 示例配置数据
const exampleConfigurations = [
    { name: 'Config 1', date: '2025-01-30T12:00:00Z' },
    { name: 'Config 2', date: '2025-01-29T15:30:00Z' },
    { name: 'Config 3', date: '2025-01-28T09:00:00Z' },
    { name: 'Config 4', date: '2025-01-28T13:45:00Z' },
    { name: 'Config 5', date: '2025-01-27T10:00:00Z' }
];

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

    // 搜索并分组按日期
    const filteredConfigurations = useMemo(() => {
        const filtered = configurations
            .filter((config) => config.name.toLowerCase().includes(searchInput.toLowerCase()))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // 按时间降序
        return groupByDate(filtered);
    }, [configurations, searchInput]);

    const handleMenuToggle = (index) => {
        setActiveMenuIndex(activeMenuIndex === index ? null : index);
    };

    return (
        <div>
            <button onClick={() => setSidebarExpanded(true)} aria-label="Open Sidebar">Open Sidebar</button>
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
                        style={{
                            position: 'absolute',
                            right: 10,
                            top: 10,
                            background: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                        }}
                    >
                        ✖
                    </button>
                )}
                <div className="sidebar-content">
                    {/* 搜索框 */}
                    <div className="search-bar" style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="Search configurations"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    {/* 日期分组显示 */}
                    {Object.keys(filteredConfigurations).length > 0 ? (
                        <div>
                            {Object.entries(filteredConfigurations).map(([dateLabel, configs]) => (
                                <div key={dateLabel}>
                                    <h4
                                        style={{
                                            marginTop: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            color: '#333',
                                        }}
                                    >
                                        {dateLabel}
                                    </h4>
                                    <ul style={{ paddingLeft: '10px' }}>
                                        {configs.map((config, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '5px 0',
                                                }}
                                            >
                                                <span>{config.name}</span>
                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        onClick={() => handleMenuToggle(index)}
                                                        aria-label="More options"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        ...
                                                    </button>
                                                    {activeMenuIndex === index && (
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
                                                            <button>Load</button>
                                                            <button>Edit</button>
                                                            <button>Download</button>
                                                            <button>Delete</button>
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
                        <div style={{ color: 'gray', fontStyle: 'italic' }}>
                            No configurations available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

CompressionSidebarPanel.propTypes = {
    configurations: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
        })
    ),
};

// 传入示例配置
export default () => <CompressionSidebarPanel configurations={exampleConfigurations} />;
