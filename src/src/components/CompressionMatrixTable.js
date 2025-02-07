import React from 'react';
import PropTypes from 'prop-types';

const MetricsTable = ({ rawData, compressedData, onSave }) => {
    const calculateMetrics = (rawData, compressedData) => {
        const rawDataPoints = rawData.length;
        const compressedDataPoints = compressedData.length;

        //compressionRatio
        const compressionRatio = (rawDataPoints / compressedDataPoints).toFixed(2);

        // storage size
        const storageSizeRaw = (rawDataPoints * 4 / (1024 * 1024)).toFixed(2); // MB
        const storageSizeCompressed = (compressedDataPoints * 4 / (1024 * 1024)).toFixed(2); // MB

        // error rate
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
                onClick={() => onSave(metrics)}
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
        </div>
    );
};

MetricsTable.propTypes = {
    rawData: PropTypes.arrayOf(PropTypes.number).isRequired,
    compressedData: PropTypes.arrayOf(PropTypes.number).isRequired,
    onSave: PropTypes.func.isRequired,
};

export default MetricsTable;