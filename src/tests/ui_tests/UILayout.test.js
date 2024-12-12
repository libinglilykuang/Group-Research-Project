import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompressionSidebarPanel from '../../src/components/CompressionSidebarPanel';

//1.5.1
//1.5.2
test('logo present', () => {
    render(<CompressionLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
});

//1.5.2
test('config panel present', () => {
    render(<CompressionConfigPanel />);
    const configPanel = screen.getByTestId('config');
    expect(configPanel).toBeInTheDocument();
});

//1.5.3
test('graph panel present', () => {
    render(<CompressionGraphPanel />);
    const graphPanel = screen.getByTestId('graph');
    expect(graphPanel).toBeInTheDocument();
});

//1.5.4
test('matrix panel present', () => {
    render(<CompressionMatrixPanel />);
    const matrixPanel = screen.getByTestId('matrix');
    expect(matrixPanel).toBeInTheDocument();
});

//1.5.5
test('save optimal parameters button present', () => {
    render(<CompressionOptimalParameterButton />);
    const saveParamButton = screen.getByTestId('save-parameters');
    expect(saveParamButton).toBeInTheDocument();
});

//1.5.6
test('sidebar toggle button present', () => {
    render(<CompressionSidebarPanel />);
    const toggleSidebarIcon = screen.getByTestId('toggle-sidebar');
    expect(toggleSidebarIcon).toBeInTheDocument();
});

//1.5.7
//will be written in playwright ;)