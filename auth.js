// Load Firebase configuration securely
async function loadFirebaseConfig() {
    try {
        // First, try to fetch from public-config.js
        const configSource = window.CONFIG_SOURCE || "firebase-remote-config";
        const projectId = window.PROJECT_ID || "gr-balance";
        
        // For local development, use local config if available
        if (configSource === "local-file" && window.firebaseConfig) {
            return window.firebaseConfig;
        }
        
        // For production, fetch from Firebase Remote Config
        const response = await fetch(`https://${projectId}.firebaseapp.com/__/firebase/init.json`);
        if (!response.ok) {
            throw new Error("Failed to load Firebase configuration");
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading Firebase config:", error);
        
        // Fallback to local config in development environments only
        if (window.firebaseConfig) {
            console.warn("Falling back to local development configuration");
            return window.firebaseConfig;
        }
        
        document.getElementById('errorMessage').textContent = 
            "Unable to connect to authentication service. Please try again later.";
        return null;
    }
}

// Initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const firebaseConfig = await loadFirebaseConfig();
    if (!firebaseConfig) return;
    
    // Initialize Firebase with the fetched or local config
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // Set up authentication state observer
    firebase.auth().onAuthStateChanged(handleAuthStateChanged);
    
    // Set up form event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if we're on the login page or main app page
    const isLoginPage = window.location.pathname.includes('login.html');
    const isMainPage = !isLoginPage;
    
    // If on the main page, add logout functionality
    if (isMainPage) {
        setupMainPageAuth();
    }
});

// Handle Firebase auth state changes
function handleAuthStateChanged(user) {
    // Check if we're on the login page
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (user) {
        // User is signed in
        if (isLoginPage) {
            // Redirect to main page when signed in on login page
            window.location.href = 'main.html';
        } else {
            // Update UI for signed in user on main page
            updateUserInfo(user);
        }
    } else {
        // User is signed out
        if (!isLoginPage) {
            // Redirect to login page when signed out on main page
            window.location.href = 'login.html';
        }
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginButton = document.getElementById('loginButton');
    
    // Reset error message
    errorMessage.textContent = '';
    
    // Add loading state
    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="spinner"></span> Signing in...';
    
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        // Success is handled by the auth state observer
    } catch (error) {
        // Show user-friendly error message
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage.textContent = 'Invalid email or password';
                break;
            case 'auth/too-many-requests':
                errorMessage.textContent = 'Too many failed attempts. Please try again later';
                break;
            default:
                errorMessage.textContent = 'Error signing in. Please try again';
                console.error('Login error:', error);
        }
        
        // Reset button
        loginButton.disabled = false;
        loginButton.textContent = 'Sign In';
    }
}

// Setup authentication for main page
function setupMainPageAuth() {
    // Find a good place to add the user info and logout button
    const container = document.querySelector('.container');
    
    if (container) {
        // Create user info container
        const userInfoContainer = document.createElement('div');
        userInfoContainer.className = 'user-info';
        userInfoContainer.id = 'userInfo';
        userInfoContainer.style.display = 'none'; // Hidden until user is authenticated
        
        // Create logout button
        const logoutButton = document.createElement('button');
        logoutButton.className = 'btn btn-secondary btn-logout';
        logoutButton.textContent = 'Sign Out';
        logoutButton.addEventListener('click', () => {
            firebase.auth().signOut();
        });
        
        // Add to page
        userInfoContainer.appendChild(logoutButton);
        container.insertBefore(userInfoContainer, container.firstChild);
    }
}

// Update user info in the UI
function updateUserInfo(user) {
    const userInfoContainer = document.getElementById('userInfo');
    
    if (userInfoContainer) {
        // Create or update avatar element
        let avatar = userInfoContainer.querySelector('.user-avatar');
        if (!avatar) {
            avatar = document.createElement('div');
            avatar.className = 'user-avatar';
            userInfoContainer.insertBefore(avatar, userInfoContainer.firstChild);
        }
        
        // Get first letter of email for avatar
        const firstLetter = user.email ? user.email.charAt(0).toUpperCase() : 'U';
        avatar.textContent = firstLetter;
        
        // Create or update email element
        let emailElement = userInfoContainer.querySelector('.user-email');
        if (!emailElement) {
            emailElement = document.createElement('span');
            emailElement.className = 'user-email';
            userInfoContainer.insertBefore(emailElement, userInfoContainer.childNodes[1]);
        }
        
        emailElement.textContent = user.email;
        
        // Show the user info container
        userInfoContainer.style.display = 'flex';
    }
}