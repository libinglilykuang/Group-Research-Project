import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Papa from 'papaparse';

const ConfigPanel = forwardRef(({ compressionFactor, setCompressionFactor, setRawData, setLabels, setFile }, ref) => {
    const [param1, setParam1] = useState('');
    const [param2, setParam2] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Format time to display only the specific time (e.g., 12:34 PM)
    const formatTime = (timeString) => {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
            return timeString; // If unable to parse as date, return the original string
        }
        // Display only hour and minute using a 12-hour clock
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // Use 12-hour format
        });
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile); // 更新当前 CSV 文件
            parseCSV(selectedFile);
        }
    };

    // Parse CSV file
    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            const csv = Papa.parse(target.result, { skipEmptyLines: true });

            if (csv.data.length > 1) { // Ensure there is data
                const dataRows = csv.data.slice(1); // Skip header row

                // Parse time and data
                const xValues = dataRows.map(row => formatTime(row[0])); // First column: time (formatted)
                const yValues = dataRows.map(row => parseFloat(row[1])); // Second column: data

                if (xValues.length > 0 && yValues.length > 0) {
                    setLabels(xValues);
                    setRawData(yValues);
                    setMessage('CSV data loaded');
                    setError('');
                } else {
                    setError('CSV file format error: valid data not found');
                }
            } else {
                setError('CSV file is empty or formatted incorrectly');
            }
        };
        reader.readAsText(file);
    };

    // Handle data selection
    const handleSelectData = () => {
        if (!file) {
            setError('Please upload a file first');
        } else {
            setError('');
            setMessage('Data selected');
        }
    };

    // Handle compression
    const handleCompress = () => {
        if (!file) {
            setError('Please upload a file first');
        } else {
            setError('');
            // Generate compressed file and trigger download
            const blob = new Blob(['Compressed Data'], { type: 'application/octet-stream' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'compressed-data.zip';
            link.click();
            URL.revokeObjectURL(downloadUrl);
            setMessage('Compressed file generated and download started');
        }
    };

    // Expose reset method and parameters
    useImperativeHandle(ref, () => ({
        reset: () => {
            setFile(null);
            setParam1('');
            setParam2('');
            setError('');
            setMessage('');
            setCompressionFactor(2); // Reset compression factor
        },
        getParams: () => ({ param1, param2 }), // 暴露当前参数
        setParams: (params) => {
            setParam1(params.param1 || '');
            setParam2(params.param2 || '');
        },
        loadFile: (file) => {
            setFile(file);
            parseCSV(file); // 解析 CSV 文件并加载数据
        },
    }));

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div>
                <label htmlFor="file-input" style={{ display: 'block', marginBottom: '10px' }}>
                    Upload File:
                </label>
                <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ marginBottom: '20px' }}
                />
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Config Parameter 1"
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
                    placeholder="Config Parameter 2"
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
});

export default ConfigPanel;