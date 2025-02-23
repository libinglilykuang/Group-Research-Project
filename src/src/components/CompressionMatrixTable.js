import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MetricsTable = ({ rawData, compressedData, onSave }) => {
    const [isSaveModalOpen, setSaveModalOpen] = useState(false);
    const [includeCSV, setIncludeCSV] = useState(false);

    // Function to calculate metrics
    const calculateMetrics = (rawData, compressedData) => {
        const rawDataPoints = rawData.length;
        const compressedDataPoints = compressedData.length;

        // Calculate compression ratio
        const compressionRatio = (rawDataPoints / compressedDataPoints).toFixed(2);

        // Calculate storage size
        const storageSizeRaw = (rawDataPoints * 4 / (1024 * 1024)).toFixed(2); // MB
        const storageSizeCompressed = (compressedDataPoints * 4 / (1024 * 1024)).toFixed(2); // MB

        // Calculate error rate
        const rawSum = rawData.reduce((sum, value) => sum + value, 0);
        const compressedSum = compressedData.reduce((sum, value) => sum + value, 0);
        const errorRate = ((1 - compressedSum / rawSum) * 100).toFixed(2);

        return [
            { name: 'Number of Data Points (Raw)', value: rawDataPoints.toString() },
            { name: 'Number of Data Points (Compressed)', value: compressedDataPoints.toString() },
            { name: 'Compression Ratio', value: compressionRatio },
            { name: 'Storage Size (Raw) (MB)', value: storageSizeRaw },
            { name: 'Storage Size (Compressed) (MB)', value: storageSizeCompressed },
            { name: 'Data Accuracy (Error Rate) (%)', value: errorRate },
        ];
    };

    const metrics = calculateMetrics(rawData, compressedData);

    // Handle save button click
    const handleSave = () => {
        setSaveModalOpen(true); // Open the modal
    };

    // Handle confirm save
    const handleConfirmSave = () => {
        const config = {
            name: `Configuration ${new Date().toLocaleString()}`,
            date: new Date().toISOString(),
            parameters: metrics.reduce((acc, metric) => {
                acc[metric.name] = metric.value;
                return acc;
            }, {}),
            includeCSV, // Whether to include CSV file
        };
        onSave(config); // Pass the configuration object to the parent component
        setSaveModalOpen(false); // Close the modal
    };

    // Handle cancel save
    const handleCancelSave = () => {
        setSaveModalOpen(false); // Close the modal
    };

    return (
        <div
            data-testid="scroll-container"
            style={{
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
            }}
        >
            {metrics.length > 0 ? (
                <table
                    role="table"
                    style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                    <thead>
                    <tr>
                        <th data-testid="header-metric" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                            Metric
                        </th>
                        <th data-testid="header-value" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                            Value
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {metrics.map((item, index) => (
                        <tr key={index} role="row">
                            <td data-testid={`row-metric-${index}`} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {item.name}
                            </td>
                            <td data-testid={`row-value-${index}`} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {item.value}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p
                    data-testid="no-data-message"
                    style={{ color: 'gray', fontStyle: 'italic', textAlign: 'center' }}
                >
                    No data available
                </p>
            )}
            <button
                onClick={handleSave}
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Save Optimal Configuration
            </button>

            {/* Save configuration modal */}
            {isSaveModalOpen && (
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
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '400px',
                            boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
                        }}
                    >
                        <h3>Save Configuration</h3>
                        <div style={{ marginBottom: '10px' }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={includeCSV}
                                    onChange={(e) => setIncludeCSV(e.target.checked)}
                                />
                                Include CSV File
                            </label>
                        </div>
                        <button
                            onClick={handleConfirmSave}
                            style={{ marginRight: '10px' }}
                        >
                            Confirm
                        </button>
                        <button onClick={handleCancelSave}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

MetricsTable.propTypes = {
    rawData: PropTypes.arrayOf(PropTypes.number).isRequired,
    compressedData: PropTypes.arrayOf(PropTypes.number).isRequired,
    onSave: PropTypes.func.isRequired,
};

export default MetricsTable;