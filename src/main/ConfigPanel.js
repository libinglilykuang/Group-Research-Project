import React, { useState } from 'react';
import PropTypes from 'prop-types';



const ConfigPanel = () => {
    const [file, setFile] = useState(null);
    const [param1, setParam1] = useState('');
    const [param2, setParam2] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSelectData = () => {
        if (!file) {
            setError('No file selected');
        } else {
            setError('');
        }
    };

    const handleCompress = () => {
        if (!file) {
            setError('No file selected');
        } else {
            setError('');
            const blob = new Blob(['Compressed Data'], { type: 'application/octet-stream' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'compressed-data.zip';
            link.click();
            URL.revokeObjectURL(downloadUrl);
            setMessage('Download initiated');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div>
                <label htmlFor="file-input" style={{ display: 'block', marginBottom: '10px' }}>
                    Upload File:
                </label>
                <input
                    id="file-input"
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ marginBottom: '20px' }}
                />
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Configure Parameter 1"
                    value={param1}
                    onChange={(e) => setParam1(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                    }}
                />
                <input
                    type="text"
                    placeholder="Configure Parameter 2"
                    value={param2}
                    onChange={(e) => setParam2(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '20px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                    }}
                />
            </div>

            <div>
                <button
                    onClick={handleSelectData}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                    }}
                >
                    Select Data
                </button>
                <button
                    onClick={handleCompress}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                    }}
                >
                    Compress
                </button>
            </div>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        </div>
    );
};

export default ConfigPanel;
