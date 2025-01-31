import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ConfigPanel from './components/ConfigPanel';
import CompressionMatrixTable from './components/CompressionMatrixTable';
import CompressionSidebarPanel from './components/CompressionSidebarPanel';

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <CompressionSidebarPanel/>
    <ConfigPanel/>
    <CompressionMatrixTable
      data = {1}
    />
  </StrictMode>
);