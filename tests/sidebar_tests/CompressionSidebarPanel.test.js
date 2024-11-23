import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompressionSidebarPanel from '../../src/components/CompressionSidebarPanel';

test('renders sidebar with title and search box', () => {
    render(<CompressionSidebarPanel />);
    screen.debug();
    expect(screen.getByText(/Compression Sidebar/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search configurations/i)).toBeInTheDocument();
});

test('opens sidebar when button is clicked', async () => {
    render(<CompressionSidebarPanel />);
    const toggleButton = screen.getByRole('button', { name: /Open Sidebar/i });
    expect(screen.queryByText(/Sidebar Content/i)).not.toBeInTheDocument();
    await userEvent.click(toggleButton);
    expect(screen.getByText(/Sidebar Content/i)).toBeVisible();
});

test('closes sidebar when button is clicked again', async () => {
    render(<CompressionSidebarPanel />);
    const toggleButton = screen.getByRole('button', { name: /Open Sidebar/i });
    await userEvent.click(toggleButton);
    expect(screen.getByText(/Sidebar Content/i)).toBeVisible();
    await userEvent.click(toggleButton);
    expect(screen.queryByText(/Sidebar Content/i)).not.toBeVisible();
});

test('clicking "..." button shows menu options', async () => {
    render(<CompressionSidebarPanel />);
    const menuButton = screen.getByRole('button', { name: /More options/i });
    await userEvent.click(menuButton);
    expect(screen.getByText(/Load/i)).toBeVisible();
    expect(screen.getByText(/Edit/i)).toBeVisible();
    expect(screen.getByText(/Download/i)).toBeVisible();
    expect(screen.getByText(/Delete/i)).toBeVisible();
});

test('filters configurations based on search input', async () => {
    render(<CompressionSidebarPanel />);
    const searchBox = screen.getByPlaceholderText(/Search configurations/i);
    await userEvent.type(searchBox, 'Config A');
    expect(screen.getByText(/Config A/i)).toBeVisible();
    expect(screen.queryByText(/Config B/i)).not.toBeInTheDocument();
});

test('shows feedback when no configurations match search', async () => {
    render(<CompressionSidebarPanel />);
    const searchBox = screen.getByPlaceholderText(/Search configurations/i);
    await userEvent.type(searchBox, 'Nonexistent');
    expect(screen.getByText(/No matching configurations/i)).toBeVisible();
});

test('activates search input field when magnifying glass is clicked', async () => {
    render(<CompressionSidebarPanel />);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    await userEvent.click(searchButton);
    const searchBox = screen.getByPlaceholderText(/Search configurations/i);
    expect(searchBox).toHaveFocus();
});

test('dynamically updates list as user types in search box', async () => {
    render(<CompressionSidebarPanel />);
    const searchBox = screen.getByPlaceholderText(/Search configurations/i);
    await userEvent.type(searchBox, 'Config');
    expect(screen.getByText(/Config A/i)).toBeVisible();
    expect(screen.queryByText(/Unrelated Item/i)).not.toBeInTheDocument();
});

test('handles special characters and long keywords without crashing', async () => {
    render(<CompressionSidebarPanel />);
    const searchBox = screen.getByPlaceholderText(/Search configurations/i);
    await userEvent.type(searchBox, '&%$@!');
    expect(screen.getByText(/No matching configurations/i)).toBeVisible();
    await userEvent.clear(searchBox);
    await userEvent.type(searchBox, 'A'.repeat(1000));
    expect(screen.getByText(/No matching configurations/i)).toBeVisible();
});

test('renders sidebar and menus correctly on desktop and mobile', () => {
    render(<CompressionSidebarPanel />);
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
    expect(screen.getByText(/Compression Sidebar/i)).toBeVisible();
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));
    expect(screen.getByText(/Compression Sidebar/i)).toBeVisible();
});
