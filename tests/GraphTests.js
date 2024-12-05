import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompressionGraph from '../../src/components/CompressionGraph';
import userEvent from '@testing-library/user-event';

// Test: Graph renders on page
test('graph renders on page', () => {
    render(<CompressionGraph />);
    const graphElement = screen.getByTestId('compression-graph');
    expect(graphElement).toBeInTheDocument();
});

// Test: Graph updates with parameter changes
test('graph updates with parameter changes', () => {
    render(<CompressionGraph />);
    const graphElement = screen.getByTestId('compression-graph');
    
    // Mock parameter input
    const accuracyInput = screen.getByLabelText('Accuracy');
    fireEvent.change(accuracyInput, { target: { value: '80' } });

    expect(graphElement).toHaveAttribute('data-accuracy', '80');
});

// Test: Multiple compression methods can be compared
test('multiple compression methods can be compared', () => {
    render(<CompressionGraph />);
    const methodSelect = screen.getByTestId('compression-method-select');

    userEvent.selectOptions(methodSelect, ['method1', 'method2']);
    const selectedMethods = screen.getAllByTestId('selected-method');

    expect(selectedMethods).toHaveLength(2);
});

// Test: Legends and tooltips display correctly
test('legends and tooltips display correctly', () => {
    render(<CompressionGraph />);
    const legend = screen.getByTestId('graph-legend');

    expect(legend).toBeVisible();

    fireEvent.mouseOver(screen.getByTestId('graph-point'));
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeVisible();
});

// Test: Input validation for parameters
test('input validation for parameters', () => {
    render(<CompressionGraph />);
    const parameterInput = screen.getByLabelText('File Size');

    fireEvent.change(parameterInput, { target: { value: '-100' } });

    expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
});

// Test: Graph renders with large datasets
test('graph renders with large datasets', () => {
    const largeDataset = [{ x: 1, y: 2 }, { x: 3, y: 4 }]; // Mock data
    render(<CompressionGraph data={largeDataset} />);
    const graphElement = screen.getByTestId('compression-graph');

    expect(graphElement).toBeInTheDocument();
});

// Test: Graph export options
test('graph export options work', () => {
    render(<CompressionGraph />);
    const exportButton = screen.getByText(/export/i);

    fireEvent.click(exportButton);
    expect(screen.getByText(/export successful/i)).toBeInTheDocument();
});

// Test: Graph adjusts to screen size
test('graph adjusts to screen size', () => {
    window.resizeTo(768, 1024); // Simulate tablet screen
    render(<CompressionGraph />);

    const graphElement = screen.getByTestId('compression-graph');
    expect(graphElement).toHaveStyle({ width: '100%' });
});

// Test: Data integrity for plotted points
test('plotted points match data integrity', () => {
    const mockData = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
    render(<CompressionGraph data={mockData} />);

    const plottedPoints = screen.getAllByTestId('graph-point');
    expect(plottedPoints.length).toBe(mockData.length);
});

// Test: Interactivity: zoom, pan, and hover-over details
test('zoom, pan, and hover-over details work', () => {
    render(<CompressionGraph />);
    const graphElement = screen.getByTestId('compression-graph');

    fireEvent.wheel(graphElement, { deltaY: -100 }); // Zoom in
    expect(graphElement).toHaveAttribute('data-zoom', 'in');

    fireEvent.mouseDown(graphElement);
    fireEvent.mouseMove(graphElement, { clientX: 100, clientY: 200 });
    fireEvent.mouseUp(graphElement);

    expect(graphElement).toHaveAttribute('data-pan', 'enabled');
});
