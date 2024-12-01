import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CompressionMatrixTable from '../../main/CompressionMatrixTable';

test('Displays original data metrics correctly', () => {
    const originalData = [
        { name: 'Metric 1', value: 'Value 1' },
        { name: 'Metric 2', value: 'Value 2' },
    ];

    render(<CompressionMatrixTable data={originalData} onSave={jest.fn()} />);

    expect(screen.getByTestId('header-metric')).toHaveTextContent('Metric');
    expect(screen.getByTestId('header-value')).toHaveTextContent('Value');

    expect(screen.getByTestId('row-metric-0')).toHaveTextContent('Metric 1');
    expect(screen.getByTestId('row-value-0')).toHaveTextContent('Value 1');
    expect(screen.getByTestId('row-metric-1')).toHaveTextContent('Metric 2');
    expect(screen.getByTestId('row-value-1')).toHaveTextContent('Value 2');
});


test('Displays original data metrics correctly', () => {
    const originalData = [
        { name: 'Metric 1', value: 'Value 1' },
        { name: 'Metric 2', value: 'Value 2' },
    ];

    render(<CompressionMatrixTable data={originalData} />);

    expect(screen.getByTestId('header-metric')).toBeInTheDocument();
    expect(screen.getByTestId('header-value')).toBeInTheDocument();

    expect(screen.getByTestId('row-metric-0')).toHaveTextContent('Metric 1');
    expect(screen.getByTestId('row-value-0')).toHaveTextContent('Value 1');
    expect(screen.getByTestId('row-metric-1')).toHaveTextContent('Metric 2');
    expect(screen.getByTestId('row-value-1')).toHaveTextContent('Value 2');
});


test('Saves optimal configuration when button is clicked', async () => {
    const onSave = jest.fn();
    const data = [{ name: 'Metric A', value: 'Value A' }];

    render(<CompressionMatrixTable data={data} onSave={onSave} />);

    const saveButton = screen.getByRole('button', { name: /Save Optimal Configuration/i });

    await userEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(data);
});

test('Updates table rows dynamically when data changes', () => {
    const { rerender } = render(
        <CompressionMatrixTable data={[{ name: 'Metric 1', value: 'Value 1' }]} onSave={jest.fn()} />
    );

    expect(screen.getByTestId('row-metric-0')).toHaveTextContent('Metric 1');
    expect(screen.getByTestId('row-value-0')).toHaveTextContent('Value 1');
    expect(screen.queryByTestId('row-metric-1')).not.toBeInTheDocument();

    rerender(<CompressionMatrixTable data={[{ name: 'Metric 2', value: 'Value 2' }]} onSave={jest.fn()} />);

    expect(screen.getByTestId('row-metric-0')).toHaveTextContent('Metric 2');
    expect(screen.getByTestId('row-value-0')).toHaveTextContent('Value 2');
    expect(screen.queryByText(/Metric 1/i)).not.toBeInTheDocument();
});


test('Handles empty datasets gracefully', () => {
    render(<CompressionMatrixTable data={[]} onSave={jest.fn()} />);

    const noDataMessage = screen.getByTestId('no-data-message');
    expect(noDataMessage).toBeInTheDocument();
    expect(noDataMessage).toHaveTextContent('No data available');

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
    const largeData = Array.from({ length: 1000 }, (_, index) => ({
        name: `Metric ${index}`,
        value: `Value ${index}`,
    }));

    render(<CompressionMatrixTable data={largeData} onSave={jest.fn()} />);

    const scrollContainer = screen.getByTestId('scroll-container');
    expect(scrollContainer).toHaveStyle({ overflow: 'auto' });

    scrollContainer.scrollTop = 100;
    expect(scrollContainer.scrollTop).toBe(100);
});
