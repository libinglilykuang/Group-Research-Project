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
            { name: 'Number of Data Points (Raw)', value: rawDataPoints.toString(), testId: 'metric-value-raw-points' },
            { name: 'Number of Data Points (Compressed)', value: compressedDataPoints.toString(), testId: 'metric-value-compressed-points' },
            { name: 'Compression Ratio', value: compressionRatio, testId: 'metric-value-ratio' },
            { name: 'Storage Size (Raw) (MB)', value: storageSizeRaw },
            { name: 'Storage Size (Compressed) (MB)', value: storageSizeCompressed },
            { name: 'Data Accuracy (Error Rate) (%)', value: errorRate, testId: 'metric-value-error-rate' },
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
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setSaveModalOpen(false);
        }
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
                width: '100%',
                boxSizing: 'border-box',
                margin: '0 auto',
                maxWidth: '95vw'
            }}
        >
            {metrics.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        role="table"
                        style={{
                            width: '100%',
                            minWidth: '500px',
                            borderCollapse: 'collapse',
                            marginBottom: '20px',
                            tableLayout: 'fixed'
                        }}
                    >
                        <thead>
                        <tr>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                backgroundColor: '#f8f9fa',
                                color: '#212529',
                                fontSize: '15px',
                                fontWeight: 600,
                                borderBottom: '2px solid #dee2e6',
                                borderTop: '1px solid #dee2e6',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>Metric</th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                backgroundColor: '#f8f9fa',
                                color: '#212529',
                                fontSize: '15px',
                                fontWeight: 600,
                                borderBottom: '2px solid #dee2e6',
                                borderTop: '1px solid #dee2e6',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {metrics.map((item, index) => (
                            <tr key={index}>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    wordBreak: 'break-word'
                                }}>{item.name}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    wordBreak: 'break-word'
                                }} data-testid={item.testId || null}>
                                    {item.value}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ color: 'gray', fontStyle: 'italic', textAlign: 'center', marginBottom: '20px' }}>
                    No data available
                </p>
            )}

            <button
                onClick={handleSave}
                style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '300px',
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
                data-testid="save-button"
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
                    onClick={handleBackdropClick}
                    data-testid="modal-backdrop"
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '90%',
                            maxWidth: '400px',
                            boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0 }}>Save Configuration</h3>
                        <div style={{ marginBottom: '10px' }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={includeCSV}
                                    onChange={(e) => setIncludeCSV(e.target.checked)}
                                    data-testid="csv-checkbox"
                                />
                                Include CSV File
                            </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleConfirmSave}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    marginRight: '10px',
                                    cursor: 'pointer'
                                }}
                                data-testid="confirm-button"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={handleCancelSave}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                data-testid="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
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
