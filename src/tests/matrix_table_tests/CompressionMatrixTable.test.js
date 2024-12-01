import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompressionMatrixTable from '../../src/components/CompressionMatrixTable';

test('Displays original data metrics correctly', () => {
    const originalData = [
        { name: 'Metric 1', value: 'Value 1' },
        { name: 'Metric 2', value: 'Value 2' },
    ];

    render(<CompressionMatrixTable data={originalData} />);

    expect(screen.getByText(/Metric/i)).toBeInTheDocument();
    expect(screen.getByText(/Value/i)).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(originalData.length + 1);

    expect(screen.getByText(/Metric 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Value 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Metric 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Value 2/i)).toBeInTheDocument();
});

test('Displays optimal configuration metrics correctly', () => {
    const optimalConfig = [
        { name: 'Compression Rate', value: '95%' },
        { name: 'Optimal Metric', value: 'Value A' },
    ];

    render(<CompressionMatrixTable data={optimalConfig} />);

    expect(screen.getByText(/Metric/i)).toBeInTheDocument();
    expect(screen.getByText(/Value/i)).toBeInTheDocument();

    expect(screen.getByText(/Compression Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/95%/i)).toBeInTheDocument();
    expect(screen.getByText(/Optimal Metric/i)).toBeInTheDocument();
    expect(screen.getByText(/Value A/i)).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(optimalConfig.length + 1);
});

import userEvent from '@testing-library/user-event';

test('Saves optimal configuration when button is clicked', async () => {
    const onSave = jest.fn();
    const data = [{ name: 'Metric A', value: 'Value A' }];

    render(<CompressionMatrixTable data={data} onSave={onSave} />);

    const saveButton = screen.getByRole('button', { name: /Save Optimal Configuration/i });

    await userEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(data);
});

test('Updates the table dynamically when parameters are adjusted', () => {
    const { rerender } = render(<CompressionMatrixTable data={[{ name: 'Metric 1', value: 'Value 1' }]} />);

    expect(screen.getByText(/Metric 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Metric 2/i)).not.toBeInTheDocument();

    rerender(<CompressionMatrixTable data={[{ name: 'Metric 2', value: 'Value 2' }]} />);

    expect(screen.getByText(/Metric 2/i)).toBeInTheDocument();
    expect(screen.queryByText(/Metric 1/i)).not.toBeInTheDocument();

    expect(screen.getByText(/Metric/i)).toBeInTheDocument();
    expect(screen.getByText(/Value/i)).toBeInTheDocument();
});

test('Handles empty datasets gracefully', () => {
    render(<CompressionMatrixTable data={[]} />);

    expect(screen.getByText(/No data available/i)).toBeInTheDocument();

    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(0);

    const saveButton = screen.getByRole('button', { name: /Save Optimal Configuration/i });
    expect(saveButton).toBeEnabled();
});

test('Displays large datasets correctly', () => {
    const largeData = Array.from({ length: 10000 }, (_, index) => ({ name: `Metric ${index}`, value: `Value ${index}` }));

    render(<CompressionMatrixTable data={largeData} />);

    expect(screen.getByText(/Metric 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Value 9999/i)).toBeInTheDocument();
});

test('Scrollbar appears and functions smoothly for large datasets', () => {
    const largeData = Array.from({ length: 1000 }, (_, index) => ({ name: `Metric ${index}`, value: `Value ${index}` }));

    render(<CompressionMatrixTable data={largeData} />);

    const table = screen.getByRole('table');
    expect(table).toHaveStyle({ overflow: 'auto' });

    table.scrollTop = 100;
    expect(table.scrollTop).toBe(100);
});
