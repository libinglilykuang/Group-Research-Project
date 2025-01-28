import React from 'react';
import PropTypes from 'prop-types';

const CompressionMatrixTable = ({ data, onSave }) => {
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
            {data.length > 0 ? (
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
    {data.map((item, index) => (
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
                onClick={() => onSave(data)}
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

CompressionMatrixTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        })
    ).isRequired,
    onSave: PropTypes.func.isRequired,
};

export default CompressionMatrixTable;
