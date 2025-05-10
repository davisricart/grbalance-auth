/* Add these styles to your existing CSS */

/* Additional Auth Styles for better error display */
#auth-error {
    color: var(--danger);
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    border-radius: 0.375rem;
}

#auth-error.success {
    color: var(--success);
    background-color: var(--success-light);
}

#auth-error.error {
    color: var(--danger);
    background-color: var(--danger-light);
}

/* Additional animation for form elements */
#signup-form input, #login-form input {
    transition: all 0.2s ease;
}

#signup-form input:focus, #login-form input:focus {
    transform: translateY(-2px);
}

.auth-btn {
    position: relative;
    overflow: hidden;
}

.auth-btn:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%, -50%);
    transform-origin: 50% 50%;
}

.auth-btn:focus:after {
    animation: ripple 1s ease-out;
}

@keyframes ripple {
    0% {
        transform: scale(0, 0);
        opacity: 0.5;
    }
    20% {
        transform: scale(25, 25);
        opacity: 0.3;
    }
    100% {
        opacity: 0;
        transform: scale(40, 40);
    }
}

/* Loading indicator */
.loading-dots:after {
    content: '.';
    animation: loading 1.5s infinite;
    display: inline-block;
    width: 20px;
    text-align: left;
}

@keyframes loading {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
}

/* Success and error icons */
.message-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    vertical-align: middle;
}

.success-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'%3E%3C/path%3E%3Cpolyline points='22 4 12 14.01 9 11.01'%3E%3C/polyline%3E%3C/svg%3E");
}

.error-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23EF4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E");
}