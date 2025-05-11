// config.js - This file provides a way to load Firebase configuration
// without exposing API keys in the HTML or client-side JavaScript

// Function to load Firebase configuration securely
async function loadFirebaseConfig() {
    try {
        // In production, we fetch the config from Firebase hosting
        const projectId = "gr-balance"; // This is not sensitive
        const response = await fetch(`https://${projectId}.firebaseapp.com/__/firebase/init.json`);
        
        if (!response.ok) {
            throw new Error("Failed to load Firebase configuration from remote source");
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error loading remote Firebase config:", error);
        
        // In development, fall back to locally stored config (not committed to Git)
        if (typeof _DEV_FIREBASE_CONFIG !== 'undefined') {
            console.warn("Using development Firebase configuration");
            return _DEV_FIREBASE_CONFIG;
        }
        
        // In production with fallback, use environment variables or other secure methods
        // This would be configured in your deployment environment
        
        console.error("No Firebase configuration available");
        return null;
    }
}

// In development, define a variable to hold config
// This won't be in the committed code, only in local development
let _DEV_FIREBASE_CONFIG = undefined;

// Function to set development config (only used locally)
function setDevFirebaseConfig(config) {
    _DEV_FIREBASE_CONFIG = config;
}