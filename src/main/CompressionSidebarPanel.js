import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CompressionSidebarPanel.css';

const CompressionSidebarPanel = ({ configurations = [] }) => {
    const [isSidebarExpanded, setSidebarExpanded] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [filteredConfigurations, setFilteredConfigurations] = useState(configurations);
    const [showMenu, setShowMenu] = useState(false);

    const toggleSidebar = () => setSidebarExpanded((prev) => !prev);

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        setFilteredConfigurations(
            configurations.filter((config) =>
                config.name.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const handleSearchIconClick = () => {
        const searchBox = document.querySelector('#search-box');
        if (searchBox) {
            searchBox.focus();
        }
    };

    const toggleMenu = () => setShowMenu((prev) => !prev);

    return (
        <div data-testid="compression-sidebar-panel">
            <div
                className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
                data-testid="sidebar"
                style={{
                    display: isSidebarExpanded ? 'block' : 'none',
                }}
            >
                <button onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    <span data-testid="toggle-sidebar">{isSidebarExpanded ? 'Close' : 'Open'}</span>
                </button>
                <div className="sidebar-content">
                    <div className="search-bar">
                        <button data-testid="search-icon" onClick={handleSearchIconClick}>
                            🔍
                        </button>
                        <input
                            id="search-box"
                            type="text"
                            placeholder="Search configurations"
                            value={searchInput}
                            onChange={handleSearchInput}
                        />
                    </div>
                    {filteredConfigurations.length > 0 ? (
                        <ul>
                            {filteredConfigurations.map((config, index) => (
                                <li key={index} data-testid={`config-${index}`}>
                                    {config.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div
                            style={{ color: 'gray', fontStyle: 'italic' }}
                            data-testid="no-config-feedback"
                        >
                            No matching configurations
                        </div>
                    )}
                </div>
            </div>
            <button onClick={toggleMenu} aria-label="More options">
                ...
            </button>
            {showMenu && (
            <div className="menu" data-testid="menu">
                <button data-testid="menu-load">Load</button>
                <button data-testid="menu-edit">Edit</button>
                <button data-testid="menu-download">Download</button>
                <button data-testid="menu-delete">Delete</button>
            </div>
            )}
        </div>
    );
};

CompressionSidebarPanel.propTypes = {
    configurations: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            group: PropTypes.string,
        })
    ),
};

export default CompressionSidebarPanel;
