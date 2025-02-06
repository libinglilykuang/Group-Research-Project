import React from 'react';
import ConfigPanel from './components/ConfigPanel';
import CompressionMatrixTable from './components/CompressionMatrixTable';
import CompressionSidebarPanel from './components/CompressionSidebarPanel';
import Chart from './components/Chart';

function App() {

    // 示例数据
    const sampleData = [
        { name: 'Metric 1', value: '123' },
        { name: 'Metric 2', value: '456' },
        { name: 'Metric 3', value: '789' },
    ];

    const sampleConfigurations = [
        { name: 'Config A', group: 'Group 1' },
        { name: 'Config B', group: 'Group 2' },
        { name: 'Config C', group: 'Group 3' },
    ];

    // 保存数据处理函数
    const handleSave = (data) => {
        console.log('Saved data:', data);
        alert('Optimal configuration saved!');
    };

    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
            <h1>Welcome to the App</h1>
            <div style={{ width: '80%' }}>
                <CompressionSidebarPanel configurations={sampleConfigurations} />
            </div>

            <div style={{ width: '80%', marginBottom: '20px' }}>
                <ConfigPanel />
            </div>

            <div style={{ width: '80%', flexGrow: 1, marginBottom: '20px' }}>
                <Chart />
            </div>

            <div style={{ width: '80%', flexShrink: 0, marginBottom: '20px' }}>
                <CompressionMatrixTable data={sampleData} onSave={handleSave} />
            </div>

        </div>
    );
}

export default App;
