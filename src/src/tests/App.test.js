import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App, { compressData } from "../App";
import { getDocs, addDoc, collection } from "firebase/firestore";
import '@testing-library/jest-dom';

// Mock firebase.js
jest.mock("../firebase", () => ({
    db: {}
}));

// Mock firebase/firestore methods
jest.mock("firebase/firestore", () => ({
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    collection: jest.fn(),
}));

// Mock child components to prevent rendering issues
jest.mock("../components/ConfigPanel", () => {
    const React = require('react'); // Use require to avoid out-of-scope issues inside jest.mock
    return React.forwardRef(() => <div>Mock ConfigPanel</div>);
});
jest.mock("../components/CompressionMatrixTable", () => () => <div>Mock MetricsTable</div>);
jest.mock("../components/CompressionSidebarPanel", () => () => <div>Mock Sidebar</div>);
jest.mock("../components/Chart", () => () => <div>Mock Chart</div>);

describe("App Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("loads configurations on mount", async () => {
        // Mock the response of getDocs
        getDocs.mockResolvedValue({
            docs: [
                { id: "1", data: () => ({ name: "Config 1" }) },
                { id: "2", data: () => ({ name: "Config 2" }) },
            ],
        });

        render(<App />);

        await waitFor(() => {
            expect(getDocs).toHaveBeenCalledTimes(1);
        });

        // Verify that the page title is rendered
        expect(screen.getByText(/Intelligent Plant Compression Optimisation/i)).toBeInTheDocument();
    });

    it("renders child components", () => {
        render(<App />);

        // Verify that all mocked child components are rendered
        expect(screen.getByText("Mock Sidebar")).toBeInTheDocument();
        expect(screen.getByText("Mock ConfigPanel")).toBeInTheDocument();
        expect(screen.getByText("Mock Chart")).toBeInTheDocument();
        expect(screen.getByText("Mock MetricsTable")).toBeInTheDocument();
    });
});
