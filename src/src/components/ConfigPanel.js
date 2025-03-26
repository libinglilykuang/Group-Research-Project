import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Papa from 'papaparse';

const ConfigPanel = forwardRef(({ setRawData, setLabels }, ref) => {
    // Configuration parameters state
    const [compressionDeviationLimit, setCompressionDeviationLimit] = useState(''); // Default: 2
    const [compressionDeviationType, setCompressionDeviationType] = useState(''); // Default: percentage
    const [exceptionFilterDeviationLimit, setExceptionFilterDeviationLimit] = useState(''); // Default: 1
    const [exceptionFilterDeviationType, setExceptionFilterDeviationType] = useState(''); // Default: absolute
    const [minResampleLimit, setMinResampleLimit] = useState(''); // Default: 0
    const [maxResampleLimit, setMaxResampleLimit] = useState(''); // Default: 5

    // File and data states
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Time range selection states
    const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [allTimes, setAllTimes] = useState([]);
    const [fullData, setFullData] = useState([]);
    const [fullLabels, setFullLabels] = useState([]);

    // Default values
    const DEFAULT_COMPRESSION_DEVIATION_LIMIT = 2;
    const DEFAULT_COMPRESSION_DEVIATION_TYPE = 'percentage';
    const DEFAULT_EXCEPTION_FILTER_DEVIATION_LIMIT = 1;
    const DEFAULT_EXCEPTION_FILTER_DEVIATION_TYPE = 'absolute';
    const DEFAULT_MIN_RESAMPLE_LIMIT = 0;
    const DEFAULT_MAX_RESAMPLE_LIMIT = 5;

    // Format timestamp to include both date and time
    const formatTime = (timeString) => {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
            return timeString;
        }
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Parse CSV file and initialize data
    const parseCSV = (file) => {
        setError('');
        setMessage('Processing file...');

        Papa.parse(file, {
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 1) {
                    const dataRows = results.data.slice(1);
                    const xValues = dataRows.map(row => formatTime(row[0]));
                    const yValues = dataRows.map(row => parseFloat(row[1]));

                    if (xValues.length > 0 && yValues.length > 0) {
                        setFullData(yValues);
                        setFullLabels(xValues);
                        setAllTimes(xValues);

                        setLabels(xValues);
                        setRawData(yValues);

                        setStartTime(xValues[0]);
                        setEndTime(xValues[xValues.length - 1]);

                        setMessage(`Loaded ${xValues.length} data points`);
                    } else {
                        setError('CSV file format error: valid data not found');
                    }
                } else {
                    setError('CSV file is empty or formatted incorrectly');
                }
            },
            error: (error) => {
                setError(`Error parsing CSV: ${error.message}`);
            }
        });
    };

    // Apply the selected time range
    const applyTimeRange = () => {
        if (!file) {
            setError('No data file loaded');
            return;
        }

        if (!startTime || !endTime) {
            setError('Please select both start and end times');
            return;
        }

        const startIndex = allTimes.indexOf(startTime);
        const endIndex = allTimes.indexOf(endTime);

        if (startIndex === -1 || endIndex === -1) {
            setError('Selected times not found in dataset');
            return;
        }

        if (startIndex > endIndex) {
            setError('Start time must be before end time');
            return;
        }

        const filteredData = fullData.slice(startIndex, endIndex + 1);
        const filteredLabels = fullLabels.slice(startIndex, endIndex + 1);

        setRawData(filteredData);
        setLabels(filteredLabels);
        setMessage(`Showing ${filteredLabels.length} points from ${startTime} to ${endTime}`);
        setShowTimeRangeModal(false);
    };

    // Reset to full time range
    const resetTimeRange = () => {
        setRawData(fullData);
        setLabels(fullLabels);
        setStartTime(allTimes[0]);
        setEndTime(allTimes[allTimes.length - 1]);
        setMessage('Showing full dataset');
        setShowTimeRangeModal(false);
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please upload a CSV file');
                return;
            }
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    // Handle compress action
    const handleCompress = () => {
        if (!file) {
            setError('Please upload a file first');
            return;
        }

        setError('');
        setMessage('Compressing data...');

        // Simulate compression process
        setTimeout(() => {
            const blob = new Blob(['Compressed Data'], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed-data.zip';
            a.click();
            URL.revokeObjectURL(url);
            setMessage('Compressed file downloaded');
        }, 1000);
    };

    // Expose component methods via ref
    useImperativeHandle(ref, () => ({
        reset: () => {
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
            setShowTimeRangeModal(false);
            setStartTime('');
            setEndTime('');
            setAllTimes([]);
            setFullData([]);
            setFullLabels([]);
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
            if (params.compressionDeviationLimit !== undefined)
                setCompressionDeviationLimit(params.compressionDeviationLimit);
            if (params.compressionDeviationType !== undefined)
                setCompressionDeviationType(params.compressionDeviationType);
            if (params.exceptionFilterDeviationLimit !== undefined)
                setExceptionFilterDeviationLimit(params.exceptionFilterDeviationLimit);
            if (params.exceptionFilterDeviationType !== undefined)
                setExceptionFilterDeviationType(params.exceptionFilterDeviationType);
            if (params.minResampleLimit !== undefined)
                setMinResampleLimit(params.minResampleLimit);
            if (params.maxResampleLimit !== undefined)
                setMaxResampleLimit(params.maxResampleLimit);
        },
        loadFile: (file) => {
            setFile(file);
            parseCSV(file);
        },
    }));

    // Time Range Modal Component
    const TimeRangeModal = () => (
        <div style={{
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
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '25px',
                width: '90%',
                maxWidth: '600px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #ccc'
            }}>
                <h3 style={{
                    color: '#333',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    Select Time Range
                </h3>

                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '15px',
                    color: '#666'
                }}>
                    <p style={{ margin: 0 }}>
                        <strong>Data Range:</strong> {allTimes[0]} to {allTimes[allTimes.length - 1]}
                    </p>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}>
                        Start Time:
                    </label>
                    <select
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '15px',
                            borderRadius: '6px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f8f9fa',
                            appearance: 'none',
                        }}
                    >
                        {allTimes.map((time, index) => (
                            <option key={`start-${index}`} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}>
                        End Time:
                    </label>
                    <select
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '15px',
                            borderRadius: '6px',
                            border: '1px solid #4CAF50',
                            backgroundColor: '#f8f9fa',
                            appearance: 'none',
                        }}
                    >
                        {allTimes.map((time, index) => (
                            <option
                                key={`end-${index}`}
                                value={time}
                                disabled={startTime && allTimes.indexOf(time) < allTimes.indexOf(startTime)}
                            >
                                {time}
                            </option>
                        ))}
                    </select>
                </div>

                {error && <p style={{
                    color: 'red',
                    marginBottom: '20px',
                    fontSize: '15px',
                    textAlign: 'center'
                }}>{error}</p>}

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '15px'
                }}>
                    <button
                        onClick={resetTimeRange}
                        style={{
                            padding: '12px',
                            fontSize: '15px',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            flex: 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#e2e2e2'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    >
                        Reset to Full Range
                    </button>
                    <button
                        onClick={applyTimeRange}
                        style={{
                            padding: '12px',
                            fontSize: '15px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            flex: 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#3d8b40'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                    >
                        Apply Time Range
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{
            padding: '30px',
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
            width: '95%',
            maxWidth: '1400px',
            marginLeft: 'auto',
            marginRight: 'auto'
        }}>
            {/* File Upload Section - Modified */}
            <div style={{
                width: '95%',
                marginBottom: '30px',
                padding: '0 20px'
            }}>
                <h2 style={{
                    color: '#333',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #eee',
                    paddingLeft: '12px'
                }}>
                    Data Source
                </h2>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    width: '100%'
                }}>
                    <div style={{
                        flex: '1 1 auto',
                        minWidth: '300px',
                        paddingLeft: '12px'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '16px',
                            marginBottom: '8px'
                        }}>
                            Upload CSV File:
                        </label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                style={{
                                    flex: '1 1 auto',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '15px',
                                    minWidth: '200px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        flex: '0 0 auto',
                        marginLeft: 'auto',
                        paddingTop: '24px'
                    }}>
                        <button
                            style={{
                                padding: '12px 20px',
                                backgroundColor: '#4CAF50', // Changed to green
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '15px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#3e8e41'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
                            onClick={() => {
                                if (!file) {
                                    setError('Please upload a CSV file first');
                                    return;
                                }
                                if (allTimes.length === 0) {
                                    setError('No valid time data available');
                                    return;
                                }
                                setShowTimeRangeModal(true);
                            }}
                        >
                            Select Time Range
                        </button>
                    </div>
                </div>
            </div>

            {/* Configuration Parameters - Aligned */}
            <div style={{
                width: '95%',
                marginBottom: '20px',
                padding: '0 20px'
            }}>
                <h2 style={{
                    color: '#333',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #eee',
                    paddingLeft: '12px'
                }}>
                    Compression Parameters
                </h2>

                {/* Compression Parameters Group */}
                <div style={{
                    display: 'flex',
                    gap: '40px',
                    marginBottom: '30px',
                    paddingLeft: '12px'
                }}>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            color: '#555',
                            fontSize: '16px'
                        }}>
                            Compression Deviation Limit:
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={compressionDeviationLimit}
                            onChange={(e) => setCompressionDeviationLimit(e.target.value)}
                            placeholder={DEFAULT_COMPRESSION_DEVIATION_LIMIT.toString()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        />
                        <span style={{
                            display: 'block',
                            fontSize: '15px',
                            color: '#666',
                            marginTop: '8px'
                        }}>
                            Maximum allowed deviation for compression (default: 2)
                        </span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            color: '#555',
                            fontSize: '16px'
                        }}>
                            Deviation Type:
                        </label>
                        <select
                            value={compressionDeviationType}
                            onChange={(e) => setCompressionDeviationType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        >
                            <option value="">Select type</option>
                            <option value="percentage">Percentage</option>
                            <option value="absolute">Absolute</option>
                        </select>
                        <span style={{
                            display: 'block',
                            fontSize: '15px',
                            color: '#666',
                            marginTop: '8px'
                        }}>
                            Type of deviation calculation (default: percentage)
                        </span>
                    </div>
                </div>

                {/* Exception Filter Parameters Group */}
                <div style={{
                    display: 'flex',
                    gap: '40px',
                    marginBottom: '30px',
                    paddingLeft: '12px'
                }}>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            color: '#555',
                            fontSize: '16px'
                        }}>
                            Exception Filter Limit:
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={exceptionFilterDeviationLimit}
                            onChange={(e) => setExceptionFilterDeviationLimit(e.target.value)}
                            placeholder={DEFAULT_EXCEPTION_FILTER_DEVIATION_LIMIT.toString()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        />
                        <span style={{
                            display: 'block',
                            fontSize: '15px',
                            color: '#666',
                            marginTop: '8px'
                        }}>
                            Threshold for filtering anomalies (default: 1)
                        </span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            color: '#555',
                            fontSize: '16px'
                        }}>
                            Deviation Type:
                        </label>
                        <select
                            value={exceptionFilterDeviationType}
                            onChange={(e) => setExceptionFilterDeviationType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        >
                            <option value="">Select type</option>
                            <option value="percentage">Percentage</option>
                            <option value="absolute">Absolute</option>
                        </select>
                        <span style={{
                            display: 'block',
                            fontSize: '15px',
                            color: '#666',
                            marginTop: '8px'
                        }}>
                            Type of deviation calculation (default: absolute)
                        </span>
                    </div>
                </div>

                {/* Resample Parameters Group */}
                <div style={{
                    display: 'flex',
                    gap: '40px',
                    marginBottom: '30px',
                    paddingLeft: '12px'
                }}>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            color: '#555',
                            fontSize: '16px'
                        }}>
                            Min Resample Interval (s):
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={minResampleLimit}
                            onChange={(e) => setMinResampleLimit(e.target.value)}
                            placeholder={DEFAULT_MIN_RESAMPLE_LIMIT.toString()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        />
                        <span style={{
                            display: 'block',
                            fontSize: '15px',
                            color: '#666',
                            marginTop: '8px'
                        }}>
                            Minimum time between samples in seconds (default: 0)
                        </span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            color: '#555',
                            fontSize: '16px'
                        }}>
                            Max Resample Interval (s):
                        </label>
                        <input
                            type="number"
                            min={minResampleLimit || DEFAULT_MIN_RESAMPLE_LIMIT}
                            value={maxResampleLimit}
                            onChange={(e) => setMaxResampleLimit(e.target.value)}
                            placeholder={DEFAULT_MAX_RESAMPLE_LIMIT.toString()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        />
                        <span style={{
                            display: 'block',
                            fontSize: '15px',
                            color: '#666',
                            marginTop: '8px'
                        }}>
                            Maximum time between samples in seconds (default: 5)
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {(error || message) && (
                <div style={{
                    width: '95%',
                    marginTop: '20px',
                    marginBottom: '10px',
                    textAlign: 'center'
                }}>
                    {error && (
                        <div style={{
                            padding: '15px',
                            borderRadius: '6px',
                            backgroundColor: '#ffebee',
                            color: '#d32f2f',
                            border: '1px solid #ef9a9a',
                            fontSize: '15px',
                            marginBottom: '10px'
                        }}>
                            {error}
                        </div>
                    )}
                    {message && (
                        <div style={{
                            padding: '15px',
                            borderRadius: '6px',
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            border: '1px solid #a5d6a7',
                            fontSize: '15px'
                        }}>
                            {message}
                        </div>
                    )}
                </div>
            )}

            {/* Compress Button */}
            <div style={{
                width: '95%',
                textAlign: 'center',
                marginTop: '10px',
                marginBottom: '20px'
            }}>
                <button
                    style={{
                        padding: '14px 28px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '17px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={handleCompress}
                >
                    Compress Data
                </button>
            </div>

            {/* Time Range Modal */}
            {showTimeRangeModal && <TimeRangeModal />}
        </div>
    );
});

export default ConfigPanel;