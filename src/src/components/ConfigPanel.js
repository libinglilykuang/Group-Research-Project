import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Papa from 'papaparse';

const ConfigPanel = forwardRef(({ compressionFactor, setCompressionFactor, setRawData, setLabels }, ref) => {
    const [deviationLimit, setDeviationLimit] = useState('');
    const [deviationType, setDeviationType] = useState('');
    const [callbackFilter, setCallbackFilter] = useState('');
    const [exceptionFilter, setExceptionFilter] = useState('');
    const [file, setFile] = useState(null); // Add file state here
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
            setFile(selectedFile); // Update current CSV file
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
            setDeviationLimit('');
            setDeviationType('');
            setCallbackFilter('');
            setExceptionFilter('');
            setError('');
            setMessage('');
            setCompressionFactor(2); // Reset compression factor
        },
        getParams: () => ({ deviationLimit, deviationType, callbackFilter, exceptionFilter }), // Expose current parameters
        setParams: (params) => {
            setDeviationLimit(params.deviationLimit || '');
            setDeviationType(params.deviationType || '');
            setCallbackFilter(params.callbackFilter || '');
            setExceptionFilter(params.exceptionFilter || '');
        },
        loadFile: (file) => {
            setFile(file);
            parseCSV(file); // Parse CSV file and load data
        },
    }));

    return (
        <div
            style={{
                padding: '20px', // Padding
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#ffffff', // Background color
                borderRadius: '8px', // Rounded corners
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Shadow
                border: '1px solid #ccc', // Border
                minHeight: '400px', // Minimum height
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Center content
            }}
        >
            <div style={{ width: '80%' }}> {/* Adjust width of parameter text boxes */}
                <label htmlFor="file-input" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                    Upload File:
                </label>
                <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#f0f0f0', // Input background color
                        border: '1px solid #4CAF50', // Dark green border
                        borderRadius: '5px',
                        width: '100%',
                    }}
                />
            </div>

            {/* Add prompt text above the text boxes */}
            <div style={{ width: '80%', textAlign: 'center', marginBottom: '20px', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
                Please enter the following parameters:
            </div>

            <div style={{ width: '80%' }}> {/* Adjust width of parameter text boxes */}
                <div style={{ marginBottom: '20px' }}> {/* Increased marginBottom */}
                    <label htmlFor="deviationLimit" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Deviation Limit:
                    </label>
                    <input
                        id="deviationLimit"
                        type="text"
                        value={deviationLimit}
                        onChange={(e) => setDeviationLimit(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50', // Dark green border
                            backgroundColor: '#f0f0f0', // Input background color
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}> {/* Increased marginBottom */}
                    <label htmlFor="deviationType" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Deviation Type:
                    </label>
                    <input
                        id="deviationType"
                        type="text"
                        value={deviationType}
                        onChange={(e) => setDeviationType(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50', // Dark green border
                            backgroundColor: '#f0f0f0', // Input background color
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}> {/* Increased marginBottom */}
                    <label htmlFor="callbackFilter" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Callback Filter:
                    </label>
                    <input
                        id="callbackFilter"
                        type="text"
                        value={callbackFilter}
                        onChange={(e) => setCallbackFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50', // Dark green border
                            backgroundColor: '#f0f0f0', // Input background color
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}> {/* Increased marginBottom */}
                    <label htmlFor="exceptionFilter" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Exception Filter:
                    </label>
                    <input
                        id="exceptionFilter"
                        type="text"
                        value={exceptionFilter}
                        onChange={(e) => setExceptionFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50', // Dark green border
                            backgroundColor: '#f0f0f0', // Input background color
                        }}
                    />
                </div>
            </div>

            <div style={{ width: '80%', textAlign: 'center' }}> {/* Center the button */}
                <button
                    onClick={handleCompress}
                    style={{
                        display: 'block',
                        width: '30%',
                        padding: '12px 20px', // Slightly larger padding
                        fontSize: '16px',
                        backgroundColor: '#28a745', // Green button background
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px', // More rounded corners
                        margin: '0 auto', // Center the button
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease, transform 0.2s ease', // Smooth transitions
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#218838'; // Darker green on hover
                        e.target.style.transform = 'scale(1.02)'; // Slight scale up
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#28a745'; // Restore original color
                        e.target.style.transform = 'scale(1)'; // Restore original size
                    }}
                    onMouseDown={(e) => {
                        e.target.style.backgroundColor = '#1e7e34'; // Even darker green on click
                        e.target.style.transform = 'scale(0.98)'; // Slight scale down
                    }}
                    onMouseUp={(e) => {
                        e.target.style.backgroundColor = '#218838'; // Restore hover color
                        e.target.style.transform = 'scale(1.02)'; // Restore hover size
                    }}
                >
                    Compress
                </button>
            </div>

            {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>} {/* Increased marginTop */}
            {message && <p style={{ color: 'green', marginTop: '20px' }}>{message}</p>} {/* Increased marginTop */}
        </div>
    );
});

export default ConfigPanel;