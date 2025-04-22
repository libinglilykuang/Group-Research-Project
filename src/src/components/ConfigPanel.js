import React, { useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import PropTypes from 'prop-types';
import Papa from 'papaparse';
import DataTable from './DataTable.js';


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
    const [isDragging, setIsDragging] = useState(false);
    const [showTable, setShowTable] = useState(false);


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
    const parseCSV = useCallback((file) => {
        setError('');
        setMessage('Processing file...');
        Papa.parse(file, {
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 1) {
                    const dataRows = results.data.slice(1);
                    const xValues = dataRows.map(row => row[0]);
                    const yValues = dataRows.map(row => parseFloat(row[1]));
                    if (xValues.length > 0 && yValues.length > 0) {
                        setFullLabels(xValues);
                        setFullData(yValues);
                        setAllTimes(xValues.map(formatTime));
                        setLabels(xValues);
                        setRawData(yValues);
                        setStartTime(xValues[0]);
                        setEndTime(xValues[xValues.length - 1]);
                        setMessage(`Loaded ${xValues.length} data points from ${file.name}`);
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
    }, [setLabels, setRawData]);

    // Handle file selection
    const handleFileSelect = useCallback((selectedFile) => {
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please upload a CSV file');
                return;
            }
            setFileState(selectedFile);
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    }, [parseCSV, setFile]);

    // Handle file input change
    const handleFileInputChange = (e) => {
        handleFileSelect(e.target.files[0]);
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
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
        setMessage(`Showing ${filteredLabels.length} points from ${formatTime(startTime)} to ${formatTime(endTime)} (${file.name})`);
        setShowTimeRangeModal(false);
    };

    // Reset to full time range
    const resetTimeRange = () => {
        setLabels(fullLabels);
        setRawData(fullData);
        setStartTime(fullLabels[0] || '');
        setEndTime(fullLabels[fullLabels.length - 1] || '');
        setMessage(`Showing full dataset (${file.name})`);
        setShowTimeRangeModal(false);
    };

    // Handle compression with proper error checking
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
        setMessage(`Optimizing parameters for ${file.name}...`);
        setTimeout(() => {
            setCompressionDeviationLimit('1.5');
            setCompressionDeviationType('percentage');
            setExceptionFilterDeviationLimit('0.8');
            setExceptionFilterDeviationType('absolute');
            setMinResampleLimit('1');
            setMaxResampleLimit('8');
            setIsOptimizing(false);
            setMessage(`Optimization complete for ${file.name}! Parameters updated.`);
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
                <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Select Time Range ({file?.name})</h3>
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

    // Style definitions
    const cardStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '20px'
    };

    const sectionTitle = {
        color: '#333',
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const rowStyle = {
        display: 'flex',
        gap: '30px',
        marginBottom: '20px'
    };

    const columnStyle = {
        flex: 1
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#555',
        fontSize: '14px'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        transition: 'border-color 0.3s'
    };

    const selectStyle = {
        ...inputStyle,
        backgroundColor: 'white'
    };

    const hintStyle = {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginTop: '4px'
    };

    const descStyle = {
        display: 'block',
        fontSize: '13px',
        color: '#666',
        marginTop: '8px'
    };

    const fileInfoStyle = {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #dee2e6',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

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
                    <button onClick={() => setShowTable(!showTable)}>
                        {showTable ? 'Hide Data Table' : 'Show Data Table'}
                    </button>
                    {showTable && <DataTable />}
                </h2>

                {/* Upload area with drag and drop support */}
                <div
                    style={{
                        width: '100%',
                        backgroundColor: isDragging ? '#f0faff' : '#e9f5ff',
                        border: `2px dashed ${isDragging ? '#4CAF50' : '#66a6ff'}`,
                        borderRadius: '20px',
                        padding: '30px 20px',
                        textAlign: 'center',
                        fontFamily: 'Arial, sans-serif',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById("csv-upload").click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
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
                        {isDragging ? 'Drop your CSV file here' : 'Upload or drag & drop your CSV file'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#777', marginTop: '6px' }}>
                        Only CSV files are supported
                    </p>

                    {/* Hidden file input */}
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                    />

                    {/* File info display */}
                    {file && (
                        <div style={fileInfoStyle}>
                            <span>Loaded file: <strong>{file.name}</strong></span>
                        </div>
                    )}

                    {/* Time range selection button */}
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
                <div style={{ padding: '20px' }}>
                    {/* Compression Parameters */}
                    <div style={cardStyle}>
                        <h3 style={sectionTitle}>📉 Compression Data</h3>
                        <div style={rowStyle}>
                            <div style={columnStyle}>
                                <label style={labelStyle}>Compression Deviation Limit:</label>
                                <input
                                    type="number"
                                    min={VALIDATION_RANGES.compressionDeviationLimit.min}
                                    max={VALIDATION_RANGES.compressionDeviationLimit.max}
                                    step={VALIDATION_RANGES.compressionDeviationLimit.step}
                                    value={compressionDeviationLimit}
                                    onChange={handleCompressionDeviationLimitChange}
                                    placeholder={DEFAULT_VALUES.compressionDeviationLimit.toString()}
                                    style={{ ...inputStyle, borderColor: error.includes('compressionDeviationLimit') ? 'red' : '#ccc' }}
                                />
                                <span style={hintStyle}>
                                    Range: {VALIDATION_RANGES.compressionDeviationLimit.min}-{VALIDATION_RANGES.compressionDeviationLimit.max}
                                </span>
                                <span style={descStyle}>Maximum allowed deviation (default: 2)</span>
                            </div>
                            <div style={columnStyle}>
                                <label style={labelStyle}>Deviation Type:</label>
                                <select
                                    value={compressionDeviationType}
                                    onChange={handleCompressionDeviationTypeChange}
                                    style={selectStyle}
                                >
                                    <option value="">Select type</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="absolute">Absolute</option>
                                </select>
                                <span style={descStyle}>Type of deviation (default: percentage)</span>
                            </div>
                        </div>
                    </div>

                    {/* Exception Filter */}
                    <div style={cardStyle}>
                        <h3 style={sectionTitle}>🚨 Exception Filter</h3>
                        <div style={rowStyle}>
                            <div style={columnStyle}>
                                <label style={labelStyle}>Exception Filter Limit:</label>
                                <input
                                    type="number"
                                    min={VALIDATION_RANGES.exceptionFilterDeviationLimit.min}
                                    max={VALIDATION_RANGES.exceptionFilterDeviationLimit.max}
                                    step={VALIDATION_RANGES.exceptionFilterDeviationLimit.step}
                                    value={exceptionFilterDeviationLimit}
                                    onChange={handleExceptionFilterDeviationLimitChange}
                                    placeholder={DEFAULT_VALUES.exceptionFilterDeviationLimit.toString()}
                                    style={{ ...inputStyle, borderColor: error.includes('exceptionFilterDeviationLimit') ? 'red' : '#ccc' }}
                                />
                                <span style={hintStyle}>
                                    Range: {VALIDATION_RANGES.exceptionFilterDeviationLimit.min}-{VALIDATION_RANGES.exceptionFilterDeviationLimit.max}
                                </span>
                                <span style={descStyle}>Threshold for anomaly filtering (default: 1)</span>
                            </div>
                            <div style={columnStyle}>
                                <label style={labelStyle}>Deviation Type:</label>
                                <select
                                    value={exceptionFilterDeviationType}
                                    onChange={handleExceptionFilterDeviationTypeChange}
                                    style={selectStyle}
                                >
                                    <option value="">Select type</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="absolute">Absolute</option>
                                </select>
                                <span style={descStyle}>Type of deviation (default: absolute)</span>
                            </div>
                        </div>
                    </div>

                    {/* Resampling Parameters */}
                    <div style={cardStyle}>
                        <h3 style={sectionTitle}>⏱ Resampling Parameters</h3>
                        <div style={rowStyle}>
                            <div style={columnStyle}>
                                <label style={labelStyle}>Min Resample Interval (s):</label>
                                <input
                                    type="number"
                                    min={VALIDATION_RANGES.minResampleLimit.min}
                                    max={VALIDATION_RANGES.minResampleLimit.max}
                                    step={VALIDATION_RANGES.minResampleLimit.step}
                                    value={minResampleLimit}
                                    onChange={handleMinResampleLimitChange}
                                    placeholder={DEFAULT_VALUES.minResampleLimit.toString()}
                                    style={{ ...inputStyle, borderColor: error.includes('minResampleLimit') ? 'red' : '#ccc' }}
                                />
                                <span style={hintStyle}>
                                    Range: {VALIDATION_RANGES.minResampleLimit.min}-{VALIDATION_RANGES.minResampleLimit.max} {VALIDATION_RANGES.minResampleLimit.unit}
                                </span>
                                <span style={descStyle}>Minimum time between samples (default: 0)</span>
                            </div>
                            <div style={columnStyle}>
                                <label style={labelStyle}>Max Resample Interval (s):</label>
                                <input
                                    type="number"
                                    min={minResampleLimit || DEFAULT_VALUES.minResampleLimit}
                                    max={VALIDATION_RANGES.maxResampleLimit.max}
                                    step={VALIDATION_RANGES.maxResampleLimit.step}
                                    value={maxResampleLimit}
                                    onChange={handleMaxResampleLimitChange}
                                    placeholder={DEFAULT_VALUES.maxResampleLimit.toString()}
                                    style={{ ...inputStyle, borderColor: error.includes('maxResampleLimit') ? 'red' : '#ccc' }}
                                />
                                <span style={hintStyle}>
                                    Range: {VALIDATION_RANGES.maxResampleLimit.min}-{VALIDATION_RANGES.maxResampleLimit.max} {VALIDATION_RANGES.maxResampleLimit.unit}
                                </span>
                                <span style={descStyle}>Maximum time between samples (default: 5)</span>
                            </div>
                        </div>
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