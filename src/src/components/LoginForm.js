import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase instance
import { FaEnvelope, FaLock } from "react-icons/fa"; // Import icons from react-icons library
import "../css/LoginForm.css"; // Import CSS styles for the login form

// LoginForm component definition
const LoginForm = ({ onLoginSuccess }) => {
    // State variables for email and password
    const [email, setEmail] = useState(""); // State for storing the email input
    const [password, setPassword] = useState(""); // State for storing the password input

    // Function to handle user login
    const handleLogin = async () => {
        try {
            // Attempt to sign in with email and password using Firebase
            await signInWithEmailAndPassword(auth, email, password);
            alert("User logged in successfully!"); // Show success message
            onLoginSuccess(); // Notify parent component of successful login
        } catch (error) {
            alert(`Error logging in: ${error.message}`); // Show error message if login fails
        }
    };

    // Function to handle user registration
    const handleRegister = async () => {
        try {
            // Attempt to create a new user with email and password using Firebase
            await createUserWithEmailAndPassword(auth, email, password);
            alert("User registered successfully!"); // Show success message
            onLoginSuccess(); // Notify parent component of successful registration
        } catch (error) {
            alert(`Error registering user: ${error.message}`); // Show error message if registration fails
        }
    };

    // Render the login form UI
    return (
        <div className="login-container">
            <div className="login-box">
                {/* Login header section */}
                <div className="login-header">
                    <h1 className="login-title">Welcome Back!</h1>
                    <p className="login-subtitle">Please log in to continue</p>
                </div>

                {/* Email input field */}
                <div className="input-group">
                    <FaEnvelope className="input-icon" /> {/* Email icon */}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // Update email state on input change
                        className="login-input"
                    />
                </div>

                {/* Password input field */}
                <div className="input-group">
                    <FaLock className="input-icon" /> {/* Password icon */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                        className="login-input"
                    />
                </div>

                {/* Login button */}
                <button onClick={handleLogin} className="login-button">
                    Login
                </button>

                {/* Footer with registration link */}
                <div className="login-footer">
                    <p>Don't have an account? <span onClick={handleRegister} className="footer-link">Sign up</span></p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm; // Export the LoginForm component