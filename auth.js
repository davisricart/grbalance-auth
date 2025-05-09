// Firebase configuration - Replace with your own values
const firebaseConfig = {
    apiKey: "AIzaSyBNdKlkXK2zLWKNbqL9HbnHgq3iHpg7AKs",
    authDomain: "gr-balance.firebaseapp.com",
    projectId: "gr-balance",
    storageBucket: "gr-balance.firebasestorage.app",
    messagingSenderId: "888884147701",
    appId: "1:888884147701:web:ec008973a873635aba5cbc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Get current page
const currentPage = window.location.pathname.split('/').pop();

// Handle login page
if (currentPage === 'login.html' || currentPage === '' || currentPage === 'index.html') {
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in, redirect back to the calling application
            const returnUrl = localStorage.getItem('returnUrl');
            if (returnUrl) {
                localStorage.removeItem('returnUrl'); // Clear it
                window.location.href = returnUrl; // Redirect back
            } else {
                // No return URL specified, redirect to default
                window.location.href = 'https://yourusername.github.io/grbalance-main/';
            }
        }
    });
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            
            try {
                await auth.signInWithEmailAndPassword(email, password);
                // Successful login will trigger the onAuthStateChanged handler above
            } catch (error) {
                errorMessage.textContent = error.message;
            }
        });
    }
    
    // Create account link
    const createAccountLink = document.getElementById('createAccountLink');
    if (createAccountLink) {
        createAccountLink.addEventListener('click', () => {
            // Preserve the return URL
            window.location.href = 'signup.html';
        });
    }
}

// Handle signup page
if (currentPage === 'signup.html') {
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorMessage = document.getElementById('errorMessage');
            
            // Validate password match
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                return;
            }
            
            try {
                // Create user
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // Create user document in Firestore with usage limits
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    subscriptionTier: 'basic', // Default to basic tier
                    usageCount: 0,
                    usageLimit: 50, // Basic tier limit
                    subscriptionStart: firebase.firestore.FieldValue.serverTimestamp(),
                    // Subscription end date will be 30 days from now
                    subscriptionEnd: new Date(new Date().setDate(new Date().getDate() + 30))
                });
                
                // Redirect back to login (which will then redirect to the application)
                window.location.href = 'login.html';
            } catch (error) {
                errorMessage.textContent = error.message;
            }
        });
    }
    
    // Login link
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
        loginLink.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
}