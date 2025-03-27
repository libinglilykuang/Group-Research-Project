import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompressionSidebarPanel from '../components/CompressionSidebarPanel';
import { db } from '../firebase';
import { deleteDoc, updateDoc } from 'firebase/firestore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Mock external dependencies
jest.mock('firebase/firestore');
jest.mock('jszip');
jest.mock('file-saver');

// Mock window.alert and other browser APIs
beforeAll(() => {
    global.alert = jest.fn();
    Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });
});

describe('CompressionSidebarPanel', () => {
    const mockConfigurations = [
        {
            id: '1',
            name: 'Config 1',
            date: '2023-01-01T00:00:00Z',
            parameters: {
                compressionDeviationLimit: 2,
                compressionDeviationType: 'percentage',
                exceptionFilterDeviationLimit: 1,
                exceptionFilterDeviationType: 'absolute',
                minResampleLimit: 0,
                maxResampleLimit: 5
            }
        }
    ];

    const mockCompressedData = [1, 2, 3, 4, 5];

    const defaultProps = {
        configurations: mockConfigurations,
        setConfigurations: jest.fn(),
        onNewConfig: jest.fn(),
        isOpen: true,
        toggleSidebar: jest.fn(),
        onLoadConfig: jest.fn(),
        compressedData: mockCompressedData
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock the offsetParent property
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            get() { return this.parentNode; }
        });
    });

    // Basic rendering test
    it('renders without crashing', () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        expect(screen.getByPlaceholderText('Search configurations')).toBeInTheDocument();
    });

    // Configuration display test
    it('displays configurations correctly', () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        expect(screen.getByText('Config 1')).toBeInTheDocument();
    });

    // Search functionality test
    it('filters configurations based on search input', () => {
        render(<CompressionSidebarPanel {...defaultProps} configurations={[
            ...mockConfigurations,
            { id: '2', name: 'Another Config', date: '2023-01-02T00:00:00Z', parameters: {} }
        ]} />);

        fireEvent.change(screen.getByPlaceholderText('Search configurations'), {
            target: { value: 'Another' }
        });

        expect(screen.getByText('Another Config')).toBeInTheDocument();
        expect(screen.queryByText('Config 1')).not.toBeInTheDocument();
    });

    // New config button test
    it('triggers onNewConfig when new config button clicked', () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        fireEvent.click(screen.getByText('Start New Configuration'));
        expect(defaultProps.onNewConfig).toHaveBeenCalled();
    });

    // Configuration loading test
    it('triggers onLoadConfig with correct config', async () => {
        render(<CompressionSidebarPanel {...defaultProps} />);

        fireEvent.click(screen.getByText('...'));
        await waitFor(() => expect(screen.getByText('Load')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Load'));

        expect(defaultProps.onLoadConfig).toHaveBeenCalledWith(mockConfigurations[0]);
    });

    // Configuration deletion test
    it('deletes configuration and shows success alert', async () => {
        render(<CompressionSidebarPanel {...defaultProps} />);

        fireEvent.click(screen.getByText('...'));
        await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(deleteDoc).toHaveBeenCalled();
            expect(global.alert).toHaveBeenCalledWith('Configuration deleted successfully!');
        });
    });

    // Download functionality test
    it('handles configuration download correctly', async () => {
        const mockZip = {
            file: jest.fn(),
            generateAsync: jest.fn().mockResolvedValue('mockBlob')
        };
        JSZip.mockImplementation(() => mockZip);

        render(<CompressionSidebarPanel {...defaultProps} />);

        fireEvent.click(screen.getByText('...'));
        await waitFor(() => expect(screen.getByText('Download')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Download'));

        await waitFor(() => expect(screen.getByText('Confirm Download')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Confirm Download'));

        await waitFor(() => {
            expect(mockZip.file).toHaveBeenCalled();
            expect(saveAs).toHaveBeenCalled();
            expect(global.alert).toHaveBeenCalledWith('Download started!');
        });
    });

    // Empty state test
    it('shows empty message when no configurations', () => {
        render(<CompressionSidebarPanel {...defaultProps} configurations={[]} />);
        expect(screen.getByText('No configurations available')).toBeInTheDocument();
    });

    // Sidebar toggle test
    it('toggles sidebar visibility', () => {
        render(<CompressionSidebarPanel {...defaultProps} isOpen={false} />);
        fireEvent.click(screen.getByAltText('Menu'));
        expect(defaultProps.toggleSidebar).toHaveBeenCalled();
    });
});