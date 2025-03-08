import React, { useState, useRef, useEffect } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MetricsTable from "./components/CompressionMatrixTable";
import CompressionSidebarPanel from "./components/CompressionSidebarPanel";
import ZoomableChart from "./components/Chart";
import LoginForm from "./components/LoginForm"; // Import LoginForm component

import { auth, db } from "./firebase"; // Import Firebase instances
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

function App() {
    // State variables
    const [rawData, setRawData] = useState([]); // Stores raw data for the chart
    const [labels, setLabels] = useState([]); // Stores labels for the chart
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls sidebar visibility
    const [configurations, setConfigurations] = useState([]); // Stores user configurations
    const [file, setFile] = useState(null); // Stores the current CSV file
    const [user, setUser] = useState(null); // Stores the currently logged-in user

    const configPanelRef = useRef(null); // Reference to the ConfigPanel component

    // Effect to listen for authentication state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user); // Set the user if logged in
                loadConfigurations(user.uid); // Load configurations for the user
            } else {
                setUser(null); // Clear the user if logged out
            }
        });
        return () => unsubscribe(); // Cleanup the listener on unmount
    }, []);

    // Function to load configurations from Firestore
    const loadConfigurations = async (userId) => {
        try {
            const q = query(collection(db, "configurations"), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const configs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setConfigurations(configs); // Update state with loaded configurations
        } catch (error) {
            console.error("Error loading configurations:", error);
        }
    };

    // Function to save a configuration to Firestore
    const handleSave = async (config) => {
        if (!user) {
            alert("Please log in to save configurations.");
            return;
        }

        // Get parameters from the ConfigPanel
        const params = configPanelRef.current ? configPanelRef.current.getParams() : {
            deviationLimit: null,
            deviationType: null,
            callbackFilter: null,
            exceptionFilter: null,
        };

        // Create a new configuration object
        const newConfig = {
            ...config,
            userId: user.uid, // Associate with the current user
            name: `Configuration ${configurations.length + 1}`, // Generate a dynamic name
            date: new Date().toISOString(), // Add the current timestamp
            parameters: {
                ...config.parameters,
                ...params,
            },
            rawData: config.includeCSV ? rawData.join("\n") : null, // Store CSV content if included
            labels: config.includeCSV ? labels : null, // Store labels if included
        };

        try {
            // Save the configuration to Firestore
            const docRef = await addDoc(collection(db, "configurations"), newConfig);
            console.log("Document written with ID:", docRef.id);

            // Update local state with the new configuration
            setConfigurations((prevConfigs) => [...prevConfigs, { id: docRef.id, ...newConfig }]);
            alert("Optimal configuration saved!");
        } catch (error) {
            console.error("Error saving configuration:", error);
            alert("Failed to save configuration. Please try again.");
        }
    };

    // Function to create a new configuration
    const handleNewConfig = () => {
        if (configPanelRef.current) {
            configPanelRef.current.reset(); // Reset the ConfigPanel
        }
        setFile(null); // Clear the current CSV file
    };

    // Function to toggle the sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Function to load a configuration into the UI
    const handleLoadConfig = (config) => {
        // Load raw data and labels into the chart
        setRawData(config.rawData ? config.rawData.split("\n") : []);
        setLabels(config.labels || []);

        // Load parameters into the ConfigPanel
        if (configPanelRef.current) {
            configPanelRef.current.setParams(config.parameters);
        }
    };

    // Function to compress data based on parameters
    const compressData = (data, labels, deviationLimit, deviationType, callbackFilter, exceptionFilter) => {
        const compressedData = [];
        const compressedLabels = [];

        // Example compression logic
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const label = labels[i];

            // Apply deviation limit
            if (deviationLimit && Math.abs(value) > deviationLimit) {
                continue; // Skip values exceeding the limit
            }

            // Apply deviation type
            if (deviationType === "positive" && value < 0) {
                continue; // Skip negative values
            } else if (deviationType === "negative" && value > 0) {
                continue; // Skip positive values
            }

            // Apply callback filter
            if (callbackFilter && !callbackFilter(value)) {
                continue; // Skip values that don't pass the filter
            }

            // Apply exception filter
            if (exceptionFilter && exceptionFilter(value)) {
                continue; // Skip values that match the exception filter
            }

            // Add the value and label to the compressed data
            compressedData.push(value);
            compressedLabels.push(label);
        }

        return { compressedData, compressedLabels };
    };

    // Function to get compression parameters from the ConfigPanel
    const getCompressionParameters = () => {
        if (configPanelRef.current) {
            return configPanelRef.current.getParams();
        }
        return {
            deviationLimit: null,
            deviationType: null,
            callbackFilter: null,
            exceptionFilter: null,
        };
    };

    // Get parameters and compress the data
    const { deviationLimit, deviationType, callbackFilter, exceptionFilter } = getCompressionParameters();
    const { compressedData, compressedLabels } = compressData(
        rawData,
        labels,
        deviationLimit,
        deviationType,
        callbackFilter,
        exceptionFilter
    );

    return (
        <div
            className="App"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                backgroundImage: "url(/icons/background.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                padding: "20px",
            }}
        >
            {/* Login form (shown if no user is logged in) */}
            {!user && <LoginForm onLoginSuccess={() => setUser(auth.currentUser)} />}

            {/* Main interface (shown if a user is logged in) */}
            {user && (
                <>
                    <h2 style={{ color: "#333", marginBottom: "20px" }}>Intelligent Plant Compression Optimisation</h2>
                    <div style={{ width: "80%" }}>
                        <CompressionSidebarPanel
                            configurations={configurations}
                            setConfigurations={setConfigurations} // Pass setConfigurations here
                            onNewConfig={handleNewConfig}
                            isOpen={isSidebarOpen}
                            toggleSidebar={toggleSidebar}
                            onLoadConfig={handleLoadConfig}
                        />
                    </div>

                    <div
                        style={{
                            width: "80%",
                            marginBottom: "20px",
                            marginLeft: isSidebarOpen ? "250px" : "0",
                            transition: "margin-left 0.3s ease",
                        }}
                    >
                        <ConfigPanel
                            ref={configPanelRef}
                            setRawData={setRawData}
                            setLabels={setLabels}
                            setFile={setFile}
                        />
                    </div>

                    <div
                        style={{
                            width: "80%",
                            flexGrow: 1,
                            marginBottom: "20px",
                            marginLeft: isSidebarOpen ? "250px" : "0",
                            transition: "margin-left 0.3s ease",
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                            padding: "20px",
                        }}
                    >
                        <ZoomableChart
                            rawData={rawData}
                            labels={labels}
                            compressedData={compressedData}
                            compressedLabels={compressedLabels}
                        />
                    </div>

                    <div
                        style={{
                            width: "80%",
                            flexShrink: 0,
                            marginBottom: "20px",
                            marginLeft: isSidebarOpen ? "250px" : "0",
                            transition: "margin-left 0.3s ease",
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                            padding: "20px",
                        }}
                    >
                        <MetricsTable
                            rawData={rawData}
                            compressedData={compressedData}
                            onSave={handleSave}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default App;