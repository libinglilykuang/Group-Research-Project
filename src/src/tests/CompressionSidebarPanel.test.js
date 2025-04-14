import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompressionSidebarPanel from '../components/CompressionSidebarPanel';
import { deleteDoc } from 'firebase/firestore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

jest.mock('firebase/firestore');
jest.mock('jszip');
jest.mock('file-saver');

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
            parameters: {}
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
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            get() { return this.parentNode; }
        });
    });

    it('renders sidebar UI correctly (1.2.1)', () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        expect(screen.getByPlaceholderText('Search configurations')).toBeInTheDocument();
        expect(screen.getByText('Start New Configuration')).toBeInTheDocument();
    });

    it('opens sidebar when button clicked (1.2.2)', () => {
        render(<CompressionSidebarPanel {...defaultProps} isOpen={false} />);
        fireEvent.click(screen.getByAltText('Menu'));
        expect(defaultProps.toggleSidebar).toHaveBeenCalled();
    });

    it('closes sidebar when button clicked again (1.2.3)', () => {
        render(<CompressionSidebarPanel {...defaultProps} isOpen={true} />);
        fireEvent.click(screen.getByAltText('Close'));
        expect(defaultProps.toggleSidebar).toHaveBeenCalled();
    });

    it('shows menu with Load, Edit, Download, and Delete (1.2.4)', async () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        fireEvent.click(screen.getByText('...'));
        await waitFor(() => {
            expect(screen.getByText('Load')).toBeInTheDocument();
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Download')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });
    });

    it('displays fallback when no keyword matches (1.2.6)', () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        fireEvent.change(screen.getByPlaceholderText('Search configurations'), {
            target: { value: 'notfound' }
        });
        expect(screen.getByText('No configurations available')).toBeInTheDocument();
    });

    it('allows focusing the search input manually (1.2.7)', () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        const input = screen.getByPlaceholderText('Search configurations');
        input.focus();
        expect(document.activeElement).toBe(input);
    });

    it('dynamically filters configurations as user types (1.2.8)', () => {
        render(<CompressionSidebarPanel {...defaultProps} configurations={[
            ...mockConfigurations,
            { id: '2', name: 'Another Config', date: '2023-01-02T00:00:00Z', parameters: {} }
        ]} />);
        fireEvent.change(screen.getByPlaceholderText('Search configurations'), {
            target: { value: 'another' }
        });
        expect(screen.getByText('Another Config')).toBeInTheDocument();
        expect(screen.queryByText('Config 1')).not.toBeInTheDocument();
    });

    it('handles special characters and long keywords (1.2.9)', () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        fireEvent.change(screen.getByPlaceholderText('Search configurations'), {
            target: { value: '!@#$%^&*()_+中文'.repeat(10) }
        });
        expect(screen.getByText('No configurations available')).toBeInTheDocument();
    });

    it('renders correctly on mobile (1.2.10)', () => {
        global.innerWidth = 375;
        render(<CompressionSidebarPanel {...defaultProps} />);
        expect(screen.getByPlaceholderText('Search configurations')).toBeInTheDocument();
    });

    it('Start New Configuration button triggers callback (1.2.11)', () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        fireEvent.click(screen.getByText('Start New Configuration'));
        expect(defaultProps.onNewConfig).toHaveBeenCalled();
    });

    it('Load menu option triggers onLoadConfig (1.2.12)', async () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        fireEvent.click(screen.getByText('...'));
        await waitFor(() => fireEvent.click(screen.getByText('Load')));
        expect(defaultProps.onLoadConfig).toHaveBeenCalledWith(mockConfigurations[0]);
    });

    it('Delete option deletes config and alerts (1.2.13)', async () => {
        render(<CompressionSidebarPanel {...defaultProps} />);
        fireEvent.click(screen.getByText('...'));
        await waitFor(() => fireEvent.click(screen.getByText('Delete')));
        await waitFor(() => {
            expect(deleteDoc).toHaveBeenCalled();
            expect(global.alert).toHaveBeenCalledWith('Configuration deleted successfully!');
        });
    });

    it('Download option compresses and triggers saveAs (1.2.14)', async () => {
        const mockZip = {
            file: jest.fn(),
            generateAsync: jest.fn().mockResolvedValue('mockBlob')
        };
        JSZip.mockImplementation(() => mockZip);

        render(<CompressionSidebarPanel {...defaultProps} />);
        fireEvent.click(screen.getByText('...'));
        await waitFor(() => fireEvent.click(screen.getByText('Download')));
        await waitFor(() => fireEvent.click(screen.getByText('Confirm Download')));

        await waitFor(() => {
            expect(mockZip.file).toHaveBeenCalled();
            expect(saveAs).toHaveBeenCalled();
            expect(global.alert).toHaveBeenCalledWith('Download started!');
        });
    });

    it('shows empty message when no configs (1.2.15)', () => {
        render(<CompressionSidebarPanel {...defaultProps} configurations={[]} />);
        expect(screen.getByText('No configurations available')).toBeInTheDocument();
    });
});
