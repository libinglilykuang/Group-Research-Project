import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import Papa from 'papaparse';

const ConfigPanel = forwardRef(({ setRawData, setLabels, setFile, onCompress }, ref) => {
    const [compressionDeviationLimit, setCompressionDeviationLimit] = useState('');
    const [compressionDeviationType, setCompressionDeviationType] = useState('');
    const [exceptionFilterDeviationLimit, setExceptionFilterDeviationLimit] = useState('');
    const [exceptionFilterDeviationType, setExceptionFilterDeviationType] = useState('');
    const [minResampleLimit, setMinResampleLimit] = useState('');
    const [maxResampleLimit, setMaxResampleLimit] = useState('');
    const [file, setFileState] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const DEFAULT_COMPRESSION_DEVIATION_LIMIT = 2;
    const DEFAULT_COMPRESSION_DEVIATION_TYPE = 'percentage';
    const DEFAULT_EXCEPTION_FILTER_DEVIATION_LIMIT = 1;
    const DEFAULT_EXCEPTION_FILTER_DEVIATION_TYPE = 'absolute';
    const DEFAULT_MIN_RESAMPLE_LIMIT = 0;
    const DEFAULT_MAX_RESAMPLE_LIMIT = 5;

    const formatTime = (timeString) => {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
            return timeString;
        }
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFileState(selectedFile);
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            const csv = Papa.parse(target.result, { skipEmptyLines: true });
            if (csv.data.length > 1) {
                const dataRows = csv.data.slice(1);
                const xValues = dataRows.map(row => formatTime(row[0]));
                const yValues = dataRows.map(row => parseFloat(row[1]));
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

    const handleCompress = () => {
        if (!file) {
            setError("Please upload a file first");
        } else {
            setError("");
            setMessage("Data compressed");
            if (onCompress) onCompress();
        }
    };

    useImperativeHandle(ref, () => ({
        reset: () => {
            setFileState(null);
            setFile(null);
            setCompressionDeviationLimit('');
            setCompressionDeviationType('');
            setExceptionFilterDeviationLimit('');
            setExceptionFilterDeviationType('');
            setMinResampleLimit('');
            setMaxResampleLimit('');
            setError('');
            setMessage('');
            setRawData([]);
            setLabels([]);
        },
        getParams: () => ({
            compressionDeviationLimit: compressionDeviationLimit || DEFAULT_COMPRESSION_DEVIATION_LIMIT,
            compressionDeviationType: compressionDeviationType || DEFAULT_COMPRESSION_DEVIATION_TYPE,
            exceptionFilterDeviationLimit: exceptionFilterDeviationLimit || DEFAULT_EXCEPTION_FILTER_DEVIATION_LIMIT,
            exceptionFilterDeviationType: exceptionFilterDeviationType || DEFAULT_EXCEPTION_FILTER_DEVIATION_TYPE,
            minResampleLimit: minResampleLimit || DEFAULT_MIN_RESAMPLE_LIMIT,
            maxResampleLimit: maxResampleLimit || DEFAULT_MAX_RESAMPLE_LIMIT,
        }),
        setParams: (params) => {
            setCompressionDeviationLimit(params.compressionDeviationLimit || '');
            setCompressionDeviationType(params.compressionDeviationType || '');
            setExceptionFilterDeviationLimit(params.exceptionFilterDeviationLimit || '');
            setExceptionFilterDeviationType(params.exceptionFilterDeviationType || '');
            setMinResampleLimit(params.minResampleLimit || '');
            setMaxResampleLimit(params.maxResampleLimit || '');
        },
        loadFile: (file) => {
            setFileState(file);
            setFile(file);
            parseCSV(file);
        },
    }));

    return (
        <div
            style={{
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #ccc',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '80px',
            }}
        >
            <div style={{ width: '80%' }}>
                <label htmlFor="file-input" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '16px' }}>
                    Upload File:
                </label>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                    Upload a CSV file containing the data to be processed. Only .csv files are accepted.
                </p>
                <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #4CAF50',
                        borderRadius: '5px',
                        width: '97%',
                        fontSize: '14px',
                    }}
                />
            </div>

            <div style={{ width: '80%', textAlign: 'center', marginBottom: '20px', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>
                Please enter the following parameters:
            </div>

            <div style={{ width: '80%' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="compressionDeviationLimit" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '16px' }}>
                        Compression Deviation Limit:
                    </label>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        The maximum allowed deviation for data compression. Enter a positive integer.
                    </p>
                    <input
                        id="compressionDeviationLimit"
                        type="number"
                        min="1"
                        value={compressionDeviationLimit}
                        onChange={(e) => setCompressionDeviationLimit(e.target.value)}
                        placeholder="2"
                        style={{
                            width: '97%',
                            padding: '10px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: compressionDeviationLimit ? '#333' : '#999',
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="compressionDeviationType" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '16px' }}>
                        Compression Deviation Type:
                    </label>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        The type of deviation for data compression. Choose "Percentage" for percentage-based deviation or "Absolute" for absolute value deviation.
                    </p>
                    <select
                        id="compressionDeviationType"
                        value={compressionDeviationType}
                        onChange={(e) => setCompressionDeviationType(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: compressionDeviationType ? '#333' : '#999',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                        }}
                    >
                        <option value="">Select Deviation Type</option>
                        <option value="percentage">Percentage</option>
                        <option value="absolute">Absolute</option>
                    </select>
                </div>
            </div>

            <div style={{ width: '80%', borderBottom: '1px solid #ccc', marginBottom: '20px' }}></div>

            <div style={{ width: '80%' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="exceptionFilterDeviationLimit" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '16px' }}>
                        Exception Filter Deviation Limit:
                    </label>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        The maximum allowed deviation for filtering out anomalies. Enter a positive integer.
                    </p>
                    <input
                        id="exceptionFilterDeviationLimit"
                        type="number"
                        min="1"
                        value={exceptionFilterDeviationLimit}
                        onChange={(e) => setExceptionFilterDeviationLimit(e.target.value)}
                        placeholder="1"
                        style={{
                            width: '97%',
                            padding: '10px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: exceptionFilterDeviationLimit ? '#333' : '#999',
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="exceptionFilterDeviationType" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '16px' }}>
                        Exception Filter Deviation Type:
                    </label>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        The type of deviation for filtering out anomalies. Choose "Percentage" for percentage-based deviation or "Absolute" for absolute value deviation.
                    </p>
                    <select
                        id="exceptionFilterDeviationType"
                        value={exceptionFilterDeviationType}
                        onChange={(e) => setExceptionFilterDeviationType(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: exceptionFilterDeviationType ? '#333' : '#999',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                        }}
                    >
                        <option value="">Select Deviation Type</option>
                        <option value="percentage">Percentage</option>
                        <option value="absolute">Absolute</option>
                    </select>
                </div>
            </div>

            <div style={{ width: '80%', borderBottom: '1px solid #ccc', marginBottom: '20px' }}></div>

            <div style={{ width: '80%' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="minResampleLimit" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '16px' }}>
                        Minimum Resample Limit:
                    </label>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        The minimum time interval (in seconds) between resamples. Enter a positive integer.
                    </p>
                    <input
                        id="minResampleLimit"
                        type="number"
                        min="0"
                        value={minResampleLimit}
                        onChange={(e) => setMinResampleLimit(e.target.value)}
                        placeholder="0"
                        style={{
                            width: '97%',
                            padding: '10px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: minResampleLimit ? '#333' : '#999',
                        }}
                    />
                </div>
                <div style={{ marginBottom: '25px' }}>
                    <label htmlFor="maxResampleLimit" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '16px' }}>
                        Maximum Resample Limit:
                    </label>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        The maximum time interval (in seconds) between resamples. Enter a positive integer greater than the minimum resample limit.
                    </p>
                    <input
                        id="maxResampleLimit"
                        type="number"
                        min={minResampleLimit ? parseInt(minResampleLimit) + 1 : 0}
                        value={maxResampleLimit}
                        onChange={(e) => setMaxResampleLimit(e.target.value)}
                        placeholder="5"
                        style={{
                            width: '97%',
                            padding: '10px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: maxResampleLimit ? '#333' : '#999',
                        }}
                    />
                </div>
            </div>

            <div style={{ width: '80%', textAlign: 'center' }}>
                <button
                    onClick={handleCompress}
                    style={{
                        display: 'block',
                        width: '30%',
                        padding: '12px 20px',
                        fontSize: '16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        margin: '0 auto',
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
                    Compress
                </button>
            </div>

            {error && <p style={{ color: 'red', marginTop: '20px', fontSize: '14px' }}>{error}</p>}
            {message && <p style={{ color: 'green', marginTop: '20px', fontSize: '14px' }}>{message}</p>}
        </div>
    );
});

ConfigPanel.propTypes = {
    setRawData: PropTypes.func.isRequired,
    setLabels: PropTypes.func.isRequired,
    setFile: PropTypes.func.isRequired,
    onCompress: PropTypes.func,
};

export default ConfigPanel;
