import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import Papa from 'papaparse';

const ConfigPanel = forwardRef(({ setRawData, setLabels }, ref) => {
    // State variables
    const [deviationLimit, setDeviationLimit] = useState(''); // Default: 2
    const [deviationType, setDeviationType] = useState(''); // Default: percentage
    const [callbackFilter, setCallbackFilter] = useState(''); // Default: 0
    const [exceptionFilter1, setExceptionFilter1] = useState(''); // Default: ''
    const [exceptionFilter2, setExceptionFilter2] = useState(''); // Default: ''
    const [minResampleLimit, setMinResampleLimit] = useState(''); // Default: 0
    const [maxResampleLimit, setMaxResampleLimit] = useState(''); // Default: 5
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [tooltip, setTooltip] = useState({ show: false, content: '', position: { x: 0, y: 0 } });
    const [showDeviationTypeOptions, setShowDeviationTypeOptions] = useState(false);  // Deviation type


    // Default values
    const DEFAULT_DEVIATION_LIMIT = 2;
    const DEFAULT_DEVIATION_TYPE = 'percentage';
    const DEFAULT_CALLBACK_FILTER = 0;
    const DEFAULT_MIN_RESAMPLE_LIMIT = 0;
    const DEFAULT_MAX_RESAMPLE_LIMIT = 5;

    // Format time to display only the specific time (e.g., 12:34 PM)
    const formatTime = (timeString) => {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
            return timeString; // If unable to parse as date, return the original string
        }
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    // Parse CSV file
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

    // Handle compression
    const handleCompress = () => {
        if (!file) {
            setError('Please upload a file first');
        } else {
            setError('');
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

    // Show tooltip
    const showTooltip = (content, event) => {
        setTooltip({
            show: true,
            content,
            position: { x: event.clientX, y: event.clientY },
        });
    };

    // Hide tooltip
    const hideTooltip = () => {
        setTooltip({ show: false, content: '', position: { x: 0, y: 0 } });
    };

    // Handle click outside tooltip
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltip.show && !event.target.closest('.tooltip-target')) {
                hideTooltip();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [tooltip.show]);

    // Expose reset method and parameters
    useImperativeHandle(ref, () => ({
        reset: () => {
            setFile(null);
            setDeviationLimit('');
            setDeviationType('');
            setCallbackFilter('');
            setExceptionFilter1('');
            setExceptionFilter2('');
            setMinResampleLimit('');
            setMaxResampleLimit('');
            setError('');
            setMessage('');
            setRawData([]); // Clear raw data
            setLabels([]); // Clear labels
        },
        getParams: () => ({
            deviationLimit: deviationLimit || DEFAULT_DEVIATION_LIMIT,
            deviationType: deviationType || DEFAULT_DEVIATION_TYPE,
            callbackFilter: callbackFilter || DEFAULT_CALLBACK_FILTER,
            exceptionFilter: {
                exceptionFilter1: exceptionFilter1 || '',
                exceptionFilter2: exceptionFilter2 || '',
                minResampleLimit: minResampleLimit || DEFAULT_MIN_RESAMPLE_LIMIT,
                maxResampleLimit: maxResampleLimit || DEFAULT_MAX_RESAMPLE_LIMIT,
            },
        }),
        setParams: (params) => {
            setDeviationLimit(params.deviationLimit || '');
            setDeviationType(params.deviationType || '');
            setCallbackFilter(params.callbackFilter || '');
            setExceptionFilter1(params.exceptionFilter?.exceptionFilter1 || '');
            setExceptionFilter2(params.exceptionFilter?.exceptionFilter2 || '');
            setMinResampleLimit(params.exceptionFilter?.minResampleLimit || '');
            setMaxResampleLimit(params.exceptionFilter?.maxResampleLimit || '');
        },
        loadFile: (file) => {
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
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #4CAF50',
                        borderRadius: '5px',
                        width: '100%',
                    }}
                />
            </div>

            <div style={{ width: '80%', textAlign: 'center', marginBottom: '20px', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
                Please enter the following parameters:
            </div>

            <div style={{ width: '80%' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="deviationLimit" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Deviation Limit:
                        <img
                            src="/icons/question_mark.png"
                            alt="Info"
                            className="tooltip-target"
                            style={{ marginLeft: '5px', cursor: 'pointer', width: '16px', height: '16px' }}
                            onClick={(e) => showTooltip('The maximum allowed deviation from the expected value.', e)}
                        />
                    </label>
                    <input
                        id="deviationLimit"
                        type="text"
                        value={deviationLimit}
                        onChange={(e) => setDeviationLimit(e.target.value)}
                        placeholder="2" // Default value
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: deviationLimit ? '#333' : '#999', // Grey if empty
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="deviationType" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Deviation Type:
                        <img
                            src="/icons/question_mark.png"
                            alt="Info"
                            className="tooltip-target"
                            style={{ marginLeft: '5px', cursor: 'pointer', width: '16px', height: '16px' }}
                            onClick={(e) => showTooltip('The type of deviation to be considered (e.g., absolute, relative).', e)}
                        />
                    </label>
                    <input
                        id="deviationType"
                        type="text"
                        value={deviationType}
                        onChange={(e) => setDeviationType(e.target.value)}
                        placeholder="" // Default value
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: deviationType ? '#333' : '#999', // Grey if empty
                        }}
                    />
                     <div style={{ marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setShowDeviationTypeOptions(!showDeviationTypeOptions)}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                borderRadius: '5px',
                                border: 'none',
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Select type
                        </button>
                        {showDeviationTypeOptions && (
                            <div style={{ marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeviationType('Absolute');
                                        setShowDeviationTypeOptions(false);
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        marginRight: '10px',
                                        fontSize: '16px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        backgroundColor: '#4CAF50',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Absolute
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeviationType('Percentage');
                                        setShowDeviationTypeOptions(false);
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '16px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        backgroundColor: '#4CAF50',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                  Percentage
                                </button>
                            </div>
                        )}
                    </div>

                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="callbackFilter" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Callback Filter:
                        <img
                            src="/icons/question_mark.png"
                            alt="Info"
                            className="tooltip-target"
                            style={{ marginLeft: '5px', cursor: 'pointer', width: '16px', height: '16px' }}
                            onClick={(e) => showTooltip('A filter to apply to callback functions.', e)}
                        />
                    </label>
                    <input
                        id="callbackFilter"
                        type="text"
                        value={callbackFilter}
                        onChange={(e) => setCallbackFilter(e.target.value)}
                        placeholder="0" // Default value
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: callbackFilter ? '#333' : '#999', // Grey if empty
                        }}
                        
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="exceptionFilter1" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Exception Filter Value 1:
                        <img
                            src="/icons/question_mark.png"
                            alt="Info"
                            className="tooltip-target"
                            style={{ marginLeft: '5px', cursor: 'pointer', width: '16px', height: '16px' }}
                            onClick={(e) => showTooltip('A filter to apply to exceptions.', e)}
                        />
                    </label>
                    <input
                        id="exceptionFilter1"
                        type="text"
                        value={exceptionFilter1}
                        onChange={(e) => setExceptionFilter1(e.target.value)}
                        placeholder="" // No default value
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: exceptionFilter1 ? '#333' : '#999', // Grey if empty
                        }}
                    />
                    
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="exceptionFilter2" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Exception Filter Value 2:
                        <img
                            src="/icons/question_mark.png"
                            alt="Info"
                            className="tooltip-target"
                            style={{ marginLeft: '5px', cursor: 'pointer', width: '16px', height: '16px' }}
                            onClick={(e) => showTooltip('A filter to apply to exceptions.', e)}
                        />
                    </label>
                    <input
                        id="exceptionFilter2"
                        type="text"
                        value={exceptionFilter2}
                        onChange={(e) => setExceptionFilter2(e.target.value)}
                        placeholder="" // No default value
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: exceptionFilter2 ? '#333' : '#999', // Grey if empty
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="minResampleLimit" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Minimum Resample Limit:
                        <img
                            src="/icons/question_mark.png"
                            alt="Info"
                            className="tooltip-target"
                            style={{ marginLeft: '5px', cursor: 'pointer', width: '16px', height: '16px' }}
                            onClick={(e) => showTooltip('For setting the minimum resample limit.', e)}
                        />
                    </label>
                    <input
                        id="minResampleLimit"
                        type="text"
                        value={minResampleLimit}
                        onChange={(e) => setMinResampleLimit(e.target.value)}
                        placeholder="0" // Default value
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: minResampleLimit ? '#333' : '#999', // Grey if empty
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="maxResampleLimit" style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>
                        Maximum Resample Limit:
                        <img
                            src="/icons/question_mark.png"
                            alt="Info"
                            className="tooltip-target"
                            style={{ marginLeft: '5px', cursor: 'pointer', width: '16px', height: '16px' }}
                            onClick={(e) => showTooltip('For setting the maximum resample limit.', e)}
                        />
                    </label>
                    <input
                        id="maxResampleLimit"
                        type="text"
                        value={maxResampleLimit}
                        onChange={(e) => setMaxResampleLimit(e.target.value)}
                        placeholder="5" // Default value
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f0f0f0',
                            color: maxResampleLimit ? '#333' : '#999', // Grey if empty
                        }}
                    />
                </div>
            </div>

            {/* Tooltip */}
            {tooltip.show && (
                <div
                    style={{
                        position: 'fixed',
                        top: tooltip.position.y + 10,
                        left: tooltip.position.x + 10,
                        backgroundColor: '#333',
                        color: '#fff',
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        zIndex: 1000,
                    }}
                >
                    {tooltip.content}
                </div>
            )}

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

            {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
            {message && <p style={{ color: 'green', marginTop: '20px' }}>{message}</p>}
        </div>
    );
});

export default ConfigPanel;