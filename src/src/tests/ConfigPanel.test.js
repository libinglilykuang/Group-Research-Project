import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigPanel from '../components/ConfigPanel';

describe('ConfigPanel Component Tests', () => {
    // Basic render test
    test('renders without crashing', () => {
        render(<ConfigPanel />);
        expect(screen.getByText('Data Source')).toBeInTheDocument();
    });

    // File upload section test
    test('renders file upload section', () => {
        const { container } = render(<ConfigPanel />);

        // Verify text presence
        expect(screen.getByText('Upload CSV File:')).toBeInTheDocument();

        // Verify button presence
        expect(screen.getByRole('button', { name: 'Select Time Range' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /compress data/i })).toBeInTheDocument();

        // Direct DOM query for file input
        const fileInput = container.querySelector('input[type="file"]');
        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute('accept', '.csv');
    });

    // Parameter configuration section test
    test('renders compression parameters section', () => {
        render(<ConfigPanel />);
        expect(screen.getByText('Compression Parameters')).toBeInTheDocument();
        expect(screen.getByText('Compression Deviation Limit:')).toBeInTheDocument();
        expect(screen.getAllByText('Deviation Type:').length).toBeGreaterThan(0);
    });

    // Action buttons rendering test
    test('renders action buttons', () => {
        render(<ConfigPanel />);
        expect(screen.getByText('Compress Data')).toBeInTheDocument();
        expect(screen.getByText('Optimize Parameters')).toBeInTheDocument();
        expect(screen.getByText('Select Time Range')).toBeInTheDocument();
    });

    // File validation tests
    describe('file validation', () => {
        test('shows error when compressing without file', () => {
            render(<ConfigPanel />);
            fireEvent.click(screen.getByText('Compress Data'));
            expect(screen.getByText('Please upload a file first')).toBeInTheDocument();
        });

        test('allows compression when file is selected', () => {
            const { container } = render(<ConfigPanel />);
            const file = new File(['test'], 'test.csv', { type: 'text/csv' });
            const fileInput = container.querySelector('input[type="file"]');
            fireEvent.change(fileInput, { target: { files: [file] } });

            fireEvent.click(screen.getByText('Compress Data'));
            expect(screen.queryByText('Please upload a file first')).not.toBeInTheDocument();
        });
    });

    // Parameter input tests
    describe('parameter input', () => {
        test('handles compression deviation limit change', () => {
            render(<ConfigPanel />);
            const input = screen.getByPlaceholderText('2');
            fireEvent.change(input, { target: { value: '5' } });
            expect(input.value).toBe('5');
        });

        test('shows error for invalid compression deviation limit', () => {
            render(<ConfigPanel />);
            const input = screen.getByPlaceholderText('2');
            fireEvent.change(input, { target: { value: '150' } });
            expect(screen.getByText(/compressionDeviationLimit must be between/)).toBeInTheDocument();
        });

        test('handles deviation type change', () => {
            render(<ConfigPanel />);
            const select = screen.getAllByRole('combobox')[0];
            fireEvent.change(select, { target: { value: 'absolute' } });
            expect(select.value).toBe('absolute');
        });
    });

    // Time range selection modal test
    test('opens time range modal when button clicked', () => {
        render(<ConfigPanel />);
        fireEvent.click(screen.getByText('Select Time Range'));
        expect(screen.getByText('Please upload a CSV file first')).toBeInTheDocument();
    });

    // Optimize button behavior test
    test('optimize button triggers optimization', async () => {
        render(<ConfigPanel />);
        fireEvent.click(screen.getByText('Optimize Parameters'));
        await waitFor(() => {
            expect(screen.getByText('Please upload a file first')).toBeInTheDocument();
        });
    });

    // Status message test
    test('displays error messages', () => {
        render(<ConfigPanel />);
        fireEvent.click(screen.getByText('Compress Data'));
        expect(screen.getByText('Please upload a file first')).toBeInTheDocument();
    });

    // Default values test
    test('shows default parameter values', () => {
        render(<ConfigPanel />);
        expect(screen.getByPlaceholderText('2')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('1')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('5')).toBeInTheDocument();
    });

    // Parameter range hint test
    test('displays parameter ranges', () => {
        render(<ConfigPanel />);
        expect(screen.getAllByText('Range: 0-100').length).toBeGreaterThan(0);
        expect(screen.getByText('Range: 0-3600 seconds')).toBeInTheDocument();
        expect(screen.getByText('Range: 0-86400 seconds')).toBeInTheDocument();
    });

    // Component unmount test
    test('unmounts cleanly', () => {
        const { unmount } = render(<ConfigPanel />);
        expect(() => unmount()).not.toThrow();
    });

    // Console error test
    test('produces no console errors', () => {
        const spy = jest.spyOn(console, 'error');
        render(<ConfigPanel />);
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });
});