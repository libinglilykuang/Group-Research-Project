import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CompressionSidebarPanel from '../components/CompressionSidebarPanel';

test('renders sidebar with title and search box', () => {
    render(<CompressionSidebarPanel />);
    const toggleSidebarIcon = screen.getByTestId('toggle-sidebar');
    expect(toggleSidebarIcon).toBeInTheDocument();

    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).not.toBeVisible();
    expect(sidebar).toHaveClass('collapsed');
});

test('opens sidebar when button is clicked', async () => {
    render(<CompressionSidebarPanel />);

    // Locate the toggle button
    const toggleButton = screen.getByLabelText(/Toggle Sidebar/i);
    const sidebar = screen.getByTestId('sidebar');

    // Validate initial state
    expect(sidebar).toHaveClass('collapsed');
    expect(sidebar).toHaveStyle('display: none');

    // Simulate click to open sidebar
    await userEvent.click(toggleButton);
    expect(sidebar).toHaveClass('expanded');
    expect(sidebar).toHaveStyle('display: block');
});

test('closes sidebar when button is clicked again', async () => {
    render(<CompressionSidebarPanel />);

    const toggleButton = screen.getByLabelText(/Toggle Sidebar/i);
    const sidebar = screen.getByTestId('sidebar');

    // Initially collapsed
    expect(sidebar).toHaveClass('collapsed');
    expect(sidebar).toHaveStyle('display: none');

    // Open the sidebar
    await userEvent.click(toggleButton);
    expect(sidebar).toHaveClass('expanded');
    expect(sidebar).toHaveStyle('display: block');

    // Close the sidebar
    await userEvent.click(toggleButton);
    expect(sidebar).toHaveClass('collapsed');
    expect(sidebar).toHaveStyle('display: none');
});

test('clicking "..." button shows menu options', async () => {
    render(<CompressionSidebarPanel />);
    const menuButton = screen.getByRole('button', { name: /More options/i });
    await userEvent.click(menuButton);

    const loadButton = screen.getByTestId('menu-load');
    const editButton = screen.getByTestId('menu-edit');
    const downloadButton = screen.getByTestId('menu-download');
    const deleteButton = screen.getByTestId('menu-delete');

    expect(loadButton).toBeVisible();
    expect(editButton).toBeVisible();
    expect(downloadButton).toBeVisible();
    expect(deleteButton).toBeVisible();
});

test('filters configurations based on search input', async () => {
    const configurations = [
        { name: 'Config A', group: 'Today' },
        { name: 'Config B', group: 'Yesterday' },
    ];
    render(<CompressionSidebarPanel configurations={configurations} />);
    const searchBox = screen.getByPlaceholderText(/Search configurations/i);
    expect(searchBox).toBeInTheDocument();
    await userEvent.type(searchBox, 'Config A');
    expect(screen.getByText(/Config A/i)).toBeInTheDocument();
    expect(screen.queryByText(/Config B/i)).not.toBeInTheDocument();
});

test('shows feedback when no configurations match search', async () => {
    const configurations = [{ name: 'Config A', group: 'Today' }];
    render(<CompressionSidebarPanel configurations={configurations} />);

    const searchBox = screen.getByPlaceholderText(/Search configurations/i);
    await userEvent.type(searchBox, 'Nonexistent Config');

    const feedback = screen.getByText(/No matching configurations/i);
    expect(feedback).toBeInTheDocument(); // Verify the element exists in the DOM
    expect(feedback).toHaveStyle({ color: 'gray', fontStyle: 'italic' }); // Verify styling
});


test('activates search input field when magnifying glass is clicked', async () => {
    render(<CompressionSidebarPanel />);

    const searchIcon = screen.getByTestId('search-icon');

    await userEvent.click(searchIcon);

    const searchBox = screen.getByPlaceholderText(/Search configurations/i);
    expect(searchBox).toBeInTheDocument();
    expect(searchBox).toHaveFocus();
});

test('dynamically updates list as user types in search box', async () => {
    const configurations = [
        { name: 'Config A' },
        { name: 'Config B' },
    ];
    render(<CompressionSidebarPanel configurations={configurations} />);
    const searchBox = screen.getByPlaceholderText(/Search configurations/i);

    await userEvent.type(searchBox, 'Config');
    expect(screen.getByText(/Config A/i)).toBeInTheDocument();
    expect(screen.getByText(/Config B/i)).toBeInTheDocument();

    await userEvent.type(searchBox, ' A');
    expect(screen.getByText(/Config A/i)).toBeInTheDocument();
    expect(screen.queryByText(/Config B/i)).not.toBeInTheDocument();
});


test('handles special characters and long keywords without crashing', async () => {
    render(<CompressionSidebarPanel />);
    const searchBox = screen.getByPlaceholderText(/Search configurations/i);

    await userEvent.type(searchBox, '&%$@!');
    expect(screen.getByText(/No matching configurations/i)).toBeInTheDocument();

    await userEvent.clear(searchBox);
    await userEvent.type(searchBox, 'A'.repeat(50));
    expect(screen.getByText(/No matching configurations/i)).toBeInTheDocument();
});


test('renders sidebar and menus correctly on desktop and mobile', () => {
    render(<CompressionSidebarPanel />);

    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    const sidebarPanel = screen.getByTestId('compression-sidebar-panel');
    expect(sidebarPanel).toBeVisible();

    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));
    expect(sidebarPanel).toBeVisible();
});
