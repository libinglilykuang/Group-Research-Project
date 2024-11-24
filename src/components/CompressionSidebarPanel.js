import React from 'react';

export default function CompressionSidebarPanel() {
    return (
        <div>
            <h1>Compression Sidebar</h1>
            <input type="text" placeholder="Search configurations" />
            <button aria-label="Toggle Sidebar">Toggle Sidebar</button>
            <div data-testid="sidebar" className="collapsed" style={{ display: 'none' }}>
                Sidebar Content
            </div>
        </div>
    );
}
