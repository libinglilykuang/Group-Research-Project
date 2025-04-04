import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MetricsTable = ({ rawData, compressedData, onSave }) => {
    const [isSaveModalOpen, setSaveModalOpen] = useState(false);
    const [includeCSV, setIncludeCSV] = useState(false);

    const calculateMetrics = (rawData, compressedData) => {
        const rawDataPoints = rawData.length;
        const compressedDataPoints = compressedData.length;
        const compressionRatio = rawDataPoints && compressedDataPoints ? (rawDataPoints / compressedDataPoints).toFixed(2) : "N/A";
        const storageSizeRaw = (rawDataPoints * 4 / (1024 * 1024)).toFixed(2);
        const storageSizeCompressed = (compressedDataPoints * 4 / (1024 * 1024)).toFixed(2);
        const rawSum = rawData.reduce((sum, value) => sum + value, 0);
        const compressedSum = compressedData.reduce((sum, value) => sum + value, 0);
        const errorRate = rawSum && compressedSum ? ((1 - compressedSum / rawSum) * 100).toFixed(2) : "N/A";

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

    const handleSave = () => setSaveModalOpen(true);
    const handleConfirmSave = () => {
        const config = {
            name: `Configuration ${new Date().toLocaleString()}`,
            date: new Date().toISOString(),
            parameters: metrics.reduce((acc, metric) => {
                acc[metric.name] = metric.value;
                return acc;
            }, {}),
            includeCSV,
        };
        onSave(config);
        setSaveModalOpen(false);
    };
    const handleCancelSave = () => setSaveModalOpen(false);

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
                    style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}
                >
                    <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Metric</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {metrics.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.value}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ color: 'gray', fontStyle: 'italic', textAlign: 'center', marginBottom: '20px' }}>
                    No data available
                </p>
            )}

            <button
                onClick={handleSave}
                style={{
                    display: 'block',
                    width: '30%',
                    padding: '12px 20px',
                    fontSize: '16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    margin: '20px auto 0',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#218838';
                    e.target.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#28a745';
                    e.target.style.transform = 'scale(1)';
                }}
                onMouseDown={(e) => {
                    e.target.style.backgroundColor = '#1e7e34';
                    e.target.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                    e.target.style.backgroundColor = '#218838';
                    e.target.style.transform = 'scale(1.02)';
                }}
            >
                Save Optimal Configuration
            </button>

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
                        <button onClick={handleConfirmSave} style={{ marginRight: '10px' }}>Confirm</button>
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
