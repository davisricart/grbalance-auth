// This file contains helper functions for Firebase interactions
// It's imported by both login.html and main.html to handle authentication

/**
 * Securely get the current user
 * @returns {Promise<Object|null>} The current authenticated user or null
 */
async function getCurrentUser() {
    // Make sure Firebase is initialized
    await ensureFirebaseInitialized();
    
    // Check if a user is already signed in
    return new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe(); // Stop listening immediately
            resolve(user);
        });
    });
}

/**
 * Make sure Firebase is initialized before performing operations
 */
async function ensureFirebaseInitialized() {
    if (firebase.apps.length === 0) {
        // Firebase hasn't been initialized yet, load config and initialize
        const config = await loadFirebaseConfig();
        firebase.initializeApp(config);
    }
}

/**
 * Check if user is authenticated, redirect to login if not
 */
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Sign out the current user
 */
async function signOut() {
    await ensureFirebaseInitialized();
    await firebase.auth().signOut();
    window.location.href = 'login.html';
}

/**
 * Get the user's profile information
 * @returns {Object} User profile info
 */
async function getUserProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    
    return {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified
    };
}