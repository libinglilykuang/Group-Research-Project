import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import userEvent from '@testing-library/user-event';
import ConfigPanel from '../components/ConfigPanel';


test('displays an error when "Select Data" is clicked without a file selected', async () => {
    render(<ConfigPanel />); 
    const selectDataButton = screen.getByRole('button', { name: /select data/i });
    await userEvent.click(selectDataButton);

    expect(screen.getByText(/no file selected/i)).toBeVisible();
});


test('saves input for valid Parameter 1', async () => {
    render(<ConfigPanel />);
    const param1Input = screen.getByPlaceholderText(/configure parameter 1/i);
    await userEvent.type(param1Input, '12345');

    expect(param1Input).toHaveValue('12345');
});


test('saves input for valid Parameter 2', async () => {
    render(<ConfigPanel />);
    const param2Input = screen.getByPlaceholderText(/configure parameter 2/i);
    await userEvent.type(param2Input, '67890');

    expect(param2Input).toHaveValue('67890');
});


test('displays an error when "Compress" is clicked without selecting a file', async () => {
    render(<ConfigPanel />);
    const compressButton = screen.getByRole('button', { name: /compress/i });
    await userEvent.click(compressButton);

    expect(screen.getByText(/no file selected/i)).toBeVisible();
});


