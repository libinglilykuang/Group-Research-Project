import React from 'react'
import ConfigPanel from '../components/ConfigPanel';
import CompressionMatrixTable from '../components/CompressionMatrixTable';
import CompressionSidebarPanel from '../components/CompressionSidebarPanel';

function App() {

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


  const handleSave = (data) => {
    console.log('Saved data:', data);
    alert('Optimal configuration saved!');
  };

  return (
      <div className="App">
        <h1>Welcome to the App</h1>
        <ConfigPanel />
        <CompressionMatrixTable data={sampleData} onSave={handleSave} />
        <CompressionSidebarPanel configurations={sampleConfigurations} />

      </div>
  );
}


export default App;
