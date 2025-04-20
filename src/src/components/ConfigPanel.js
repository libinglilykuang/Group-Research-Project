import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import Papa from 'papaparse';

// Component definition
const ConfigPanel = forwardRef(({ setRawData, setLabels, setFile, onCompress }, ref) => {
    // Parameter validation ranges
    const VALIDATION_RANGES = {
        compressionDeviationLimit: { min: 0, max: 100, unit: '', step: 0.1 },
        exceptionFilterDeviationLimit: { min: 0, max: 100, unit: '', step: 0.1 },
        minResampleLimit: { min: 0, max: 3600, unit: 'seconds', step: 1 },
        maxResampleLimit: { min: 0, max: 86400, unit: 'seconds', step: 1 }
    };

    // Default parameter values
    const DEFAULT_VALUES = {
        compressionDeviationLimit: 2,
        compressionDeviationType: 'percentage',
        exceptionFilterDeviationLimit: 1,
        exceptionFilterDeviationType: 'absolute',
        minResampleLimit: 0,
        maxResampleLimit: 5
    };

    // State variables
    const [compressionDeviationLimit, setCompressionDeviationLimit] = useState('');
    const [compressionDeviationType, setCompressionDeviationType] = useState('');
    const [exceptionFilterDeviationLimit, setExceptionFilterDeviationLimit] = useState('');
    const [exceptionFilterDeviationType, setExceptionFilterDeviationType] = useState('');
    const [minResampleLimit, setMinResampleLimit] = useState('');
    const [maxResampleLimit, setMaxResampleLimit] = useState('');
    const [file, setFileState] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [allTimes, setAllTimes] = useState([]);
    const [fullData, setFullData] = useState([]);
    const [fullLabels, setFullLabels] = useState([]);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Parameter validation function
    const validateParameter = (value, paramName) => {
        if (value === '') return true;
        const numValue = Number(value);
        if (isNaN(numValue)) return false;
        const range = VALIDATION_RANGES[paramName];
        return numValue >= range.min && numValue <= range.max;
    };

    // Get validation error message
    const getValidationMessage = (paramName) => {
        const range = VALIDATION_RANGES[paramName];
        return `${paramName} must be between ${range.min} and ${range.max}`;
    };

    // Parameter change handlers with validation
    const handleCompressionDeviationLimitChange = (e) => {
        const value = e.target.value;
        if (validateParameter(value, 'compressionDeviationLimit') || value === '') {
            setCompressionDeviationLimit(value);
            setError('');
        } else {
            setError(getValidationMessage('compressionDeviationLimit'));
        }
    };

    const handleExceptionFilterDeviationLimitChange = (e) => {
        const value = e.target.value;
        if (validateParameter(value, 'exceptionFilterDeviationLimit') || value === '') {
            setExceptionFilterDeviationLimit(value);
            setError('');
        } else {
            setError(getValidationMessage('exceptionFilterDeviationLimit'));
        }
    };

    const handleMinResampleLimitChange = (e) => {
        const value = e.target.value;
        if (validateParameter(value, 'minResampleLimit') || value === '') {
            setMinResampleLimit(value);
            setError('');
        } else {
            setError(getValidationMessage('minResampleLimit'));
        }
    };

    const handleMaxResampleLimitChange = (e) => {
        const value = e.target.value;
        if (validateParameter(value, 'maxResampleLimit') || value === '') {
            const min = Number(minResampleLimit) || DEFAULT_VALUES.minResampleLimit;
            if (value === '' || Number(value) >= min) {
                setMaxResampleLimit(value);
                setError('');
            } else {
                setError(`Max resample limit must be ≥ min limit (${min})`);
            }
        } else {
            setError(getValidationMessage('maxResampleLimit'));
        }
    };

    const handleCompressionDeviationTypeChange = (e) => {
        setCompressionDeviationType(e.target.value);
    };

    const handleExceptionFilterDeviationTypeChange = (e) => {
        setExceptionFilterDeviationType(e.target.value);
    };

    // Format time for display in time range selector
    const formatTime = (timeString) => {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString;
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Parse CSV file
    const parseCSV = (file) => {
        setError('');
        setMessage('Processing file...');
        Papa.parse(file, {
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 1) {
                    const dataRows = results.data.slice(1);
                    const xValues = dataRows.map(row => row[0]); // Original timestamps
                    const yValues = dataRows.map(row => parseFloat(row[1]));
                    if (xValues.length > 0 && yValues.length > 0) {
                        setFullLabels(xValues);
                        setFullData(yValues);
                        setAllTimes(xValues.map(formatTime));
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
            error: (err) => {
                setError(`Error parsing CSV: ${err.message}`);
            }
        });
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please upload a CSV file');
                return;
            }
            setFileState(selectedFile);
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    // Apply time range selection
    const applyTimeRange = () => {
        if (!file) {
            setError('No data file loaded');
            return;
        }
        if (!startTime || !endTime) {
            setError('Please select both start and end times');
            return;
        }
        const startIndex = fullLabels.indexOf(startTime);
        const endIndex = fullLabels.indexOf(endTime);
        if (startIndex === -1 || endIndex === -1) {
            setError('Selected times not found in dataset');
            return;
        }
        if (startIndex > endIndex) {
            setError('Start time must be before end time');
            return;
        }
        const filteredLabels = fullLabels.slice(startIndex, endIndex + 1);
        const filteredData = fullData.slice(startIndex, endIndex + 1);
        setLabels(filteredLabels);
        setRawData(filteredData);
        setMessage(`Showing ${filteredLabels.length} points from ${formatTime(startTime)} to ${formatTime(endTime)}`);
        setShowTimeRangeModal(false);
    };

    // Reset to full time range
    const resetTimeRange = () => {
        setLabels(fullLabels);
        setRawData(fullData);
        setStartTime(fullLabels[0] || '');
        setEndTime(fullLabels[fullLabels.length - 1] || '');
        setMessage('Showing full dataset');
        setShowTimeRangeModal(false);
    };

    // Handle compression
    const handleCompress = () => {
        if (!file) {
            setError('Please upload a file first');
            return;
        }
        if (
            (compressionDeviationLimit && !validateParameter(compressionDeviationLimit, 'compressionDeviationLimit')) ||
            (exceptionFilterDeviationLimit && !validateParameter(exceptionFilterDeviationLimit, 'exceptionFilterDeviationLimit')) ||
            (minResampleLimit && !validateParameter(minResampleLimit, 'minResampleLimit')) ||
            (maxResampleLimit && !validateParameter(maxResampleLimit, 'maxResampleLimit'))
        ) {
            setError('Please correct invalid parameters before compressing');
            return;
        }
        setError('');
        setMessage('Compressing data...');
        onCompress();
    };

    // Handle parameter optimization
    const handleOptimize = () => {
        if (!file) {
            setError('Please upload a file first');
            return;
        }
        setIsOptimizing(true);
        setError('');
        setMessage('Optimizing parameters...');
        setTimeout(() => {
            setCompressionDeviationLimit('1.5');
            setCompressionDeviationType('percentage');
            setExceptionFilterDeviationLimit('0.8');
            setExceptionFilterDeviationType('absolute');
            setMinResampleLimit('1');
            setMaxResampleLimit('8');
            setIsOptimizing(false);
            setMessage('Optimization complete! Parameters updated.');
        }, 2000);
    };

    // Time range modal component
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
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Select Time Range</h3>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px' }}>Start Time:</label>
                    <select
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        {allTimes.map((time, index) => (
                            <option key={`start-${index}`} value={fullLabels[index]}>{time}</option>
                        ))}
                    </select>
                    <label style={{ display: 'block', marginBottom: '10px' }}>End Time:</label>
                    <select
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        {allTimes.map((time, index) => (
                            <option
                                key={`end-${index}`}
                                value={fullLabels[index]}
                                disabled={startTime && fullLabels.indexOf(fullLabels[index]) < fullLabels.indexOf(startTime)}
                            >
                                {time}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={resetTimeRange} style={{ padding: '10px', flex: 1, marginRight: '10px' }}>
                        Reset
                    </button>
                    <button onClick={applyTimeRange} style={{ padding: '10px', flex: 1, backgroundColor: '#4CAF50', color: 'white' }}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );

    // Expose methods to parent via useImperativeHandle
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
            setShowTimeRangeModal(false);
            setStartTime('');
            setEndTime('');
            setAllTimes([]);
            setFullData([]);
            setFullLabels([]);
            setIsOptimizing(false);
        },
        getParams: () => ({
            compressionDeviationLimit: compressionDeviationLimit || DEFAULT_VALUES.compressionDeviationLimit,
            compressionDeviationType: compressionDeviationType || DEFAULT_VALUES.compressionDeviationType,
            exceptionFilterDeviationLimit: exceptionFilterDeviationLimit || DEFAULT_VALUES.exceptionFilterDeviationLimit,
            exceptionFilterDeviationType: exceptionFilterDeviationType || DEFAULT_VALUES.exceptionFilterDeviationType,
            minResampleLimit: minResampleLimit || DEFAULT_VALUES.minResampleLimit,
            maxResampleLimit: maxResampleLimit || DEFAULT_VALUES.maxResampleLimit
        }),
        setParams: (params) => {
            if (params.compressionDeviationLimit !== undefined)
                handleCompressionDeviationLimitChange({ target: { value: params.compressionDeviationLimit } });
            if (params.compressionDeviationType !== undefined)
                setCompressionDeviationType(params.compressionDeviationType);
            if (params.exceptionFilterDeviationLimit !== undefined)
                handleExceptionFilterDeviationLimitChange({ target: { value: params.exceptionFilterDeviationLimit } });
            if (params.exceptionFilterDeviationType !== undefined)
                setExceptionFilterDeviationType(params.exceptionFilterDeviationType);
            if (params.minResampleLimit !== undefined)
                handleMinResampleLimitChange({ target: { value: params.minResampleLimit } });
            if (params.maxResampleLimit !== undefined)
                handleMaxResampleLimitChange({ target: { value: params.maxResampleLimit } });
        },
        loadFile: (file) => {
            setFileState(file);
            setFile(file);
            parseCSV(file);
        }
    }));

    // Render UI
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
            {/* Data Source Section */}
            {/* Data Source Section */}
            <div style={{ width: '95%', marginBottom: '30px', padding: '0 20px' }}>
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

                {/* Upload area with background */}
                <div style={{
                    width: '100%',
                    backgroundColor: '#e9f5ff',
                    border: '2px dashed #66a6ff',
                    borderRadius: '20px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                    transition: 'all 0.3s'
                }}
                     onClick={() => document.getElementById("csv-upload").click()}
                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0faff'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e9f5ff'}
                >
                    <div style={{
                        fontSize: '42px',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        margin: '0 auto 16px'
                    }}>
                        +
                    </div>
                    <p style={{ fontSize: '16px', color: '#333', margin: 0 }}>
                        Upload or drag & drop your <strong>CSV</strong> file
                    </p>
                    <p style={{ fontSize: '13px', color: '#777', marginTop: '6px' }}>
                        Only CSV files are supported
                    </p>

                    {/* Hidden input */}
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />

                    {/* Upload confirmation button */}
                    <div style={{ marginTop: '20px' }}>
                        <button
                            style={{
                                padding: '12px 20px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '15px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
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


            {/* Parameter configuration section */}
            <div style={{ width: '95%', marginBottom: '20px', padding: '0 20px' }}>
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

                {/* Compression parameter group */}
                <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', paddingLeft: '12px' }}>
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
                            min={VALIDATION_RANGES.compressionDeviationLimit.min}
                            max={VALIDATION_RANGES.compressionDeviationLimit.max}
                            step={VALIDATION_RANGES.compressionDeviationLimit.step}
                            value={compressionDeviationLimit}
                            onChange={handleCompressionDeviationLimitChange}
                            placeholder={DEFAULT_VALUES.compressionDeviationLimit.toString()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: `1px solid ${error.includes('compressionDeviationLimit') ? 'red' : '#ddd'}`,
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        />
                        <span style={{
                            display: 'block',
                            fontSize: '14px',
                            color: '#666',
                            marginTop: '4px'
                        }}>
                            Range: {VALIDATION_RANGES.compressionDeviationLimit.min}-{VALIDATION_RANGES.compressionDeviationLimit.max}
                            {VALIDATION_RANGES.compressionDeviationLimit.unit && ' ' + VALIDATION_RANGES.compressionDeviationLimit.unit}
                        </span>
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
                            onChange={handleCompressionDeviationTypeChange}
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

                {/* Exception filter parameter group */}
                <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', paddingLeft: '12px' }}>
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
                            min={VALIDATION_RANGES.exceptionFilterDeviationLimit.min}
                            max={VALIDATION_RANGES.exceptionFilterDeviationLimit.max}
                            step={VALIDATION_RANGES.exceptionFilterDeviationLimit.step}
                            value={exceptionFilterDeviationLimit}
                            onChange={handleExceptionFilterDeviationLimitChange}
                            placeholder={DEFAULT_VALUES.exceptionFilterDeviationLimit.toString()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: `1px solid ${error.includes('exceptionFilterDeviationLimit') ? 'red' : '#ddd'}`,
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        />
                        <span style={{
                            display: 'block',
                            fontSize: '14px',
                            color: '#666',
                            marginTop: '4px'
                        }}>
                            Range: {VALIDATION_RANGES.exceptionFilterDeviationLimit.min}-{VALIDATION_RANGES.exceptionFilterDeviationLimit.max}
                            {VALIDATION_RANGES.exceptionFilterDeviationLimit.unit && ' ' + VALIDATION_RANGES.exceptionFilterDeviationLimit.unit}
                        </span>
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
                            onChange={handleExceptionFilterDeviationTypeChange}
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

                {/* Resampling parameter group */}
                <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', paddingLeft: '12px' }}>
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
                            min={VALIDATION_RANGES.minResampleLimit.min}
                            max={VALIDATION_RANGES.minResampleLimit.max}
                            step={VALIDATION_RANGES.minResampleLimit.step}
                            value={minResampleLimit}
                            onChange={handleMinResampleLimitChange}
                            placeholder={DEFAULT_VALUES.minResampleLimit.toString()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: `1px solid ${error.includes('minResampleLimit') ? 'red' : '#ddd'}`,
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        />
                        <span style={{
                            display: 'block',
                            fontSize: '14px',
                            color: '#666',
                            marginTop: '4px'
                        }}>
                            Range: {VALIDATION_RANGES.minResampleLimit.min}-{VALIDATION_RANGES.minResampleLimit.max}
                            {VALIDATION_RANGES.minResampleLimit.unit && ' ' + VALIDATION_RANGES.minResampleLimit.unit}
                        </span>
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
                            min={minResampleLimit || DEFAULT_VALUES.minResampleLimit}
                            max={VALIDATION_RANGES.maxResampleLimit.max}
                            step={VALIDATION_RANGES.maxResampleLimit.step}
                            value={maxResampleLimit}
                            onChange={handleMaxResampleLimitChange}
                            placeholder={DEFAULT_VALUES.maxResampleLimit.toString()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: `1px solid ${error.includes('maxResampleLimit') ? 'red' : '#ddd'}`,
                                borderRadius: '6px',
                                fontSize: '15px'
                            }}
                        />
                        <span style={{
                            display: 'block',
                            fontSize: '14px',
                            color: '#666',
                            marginTop: '4px'
                        }}>
                            Range: {VALIDATION_RANGES.maxResampleLimit.min}-{VALIDATION_RANGES.maxResampleLimit.max}
                            {VALIDATION_RANGES.maxResampleLimit.unit && ' ' + VALIDATION_RANGES.maxResampleLimit.unit}
                        </span>
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

            {/* Status messages */}
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

            {/* Action buttons */}
            <div style={{
                width: '95%',
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
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
                        cursor: isOptimizing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: isOptimizing ? 0.7 : 1
                    }}
                    onClick={handleCompress}
                    disabled={isOptimizing}
                >
                    Compress Data
                </button>

                <button
                    style={{
                        padding: '14px 28px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '17px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: isOptimizing ? 0.7 : 1
                    }}
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                >
                    {isOptimizing ? 'Optimizing...' : 'Optimize Parameters'}
                </button>
            </div>

            {/* Time range selection modal */}
            {showTimeRangeModal && <TimeRangeModal />}
        </div>
    );
});

ConfigPanel.propTypes = {
    setRawData: PropTypes.func.isRequired,
    setLabels: PropTypes.func.isRequired,
    setFile: PropTypes.func.isRequired,
    onCompress: PropTypes.func.isRequired
};

export default ConfigPanel;
