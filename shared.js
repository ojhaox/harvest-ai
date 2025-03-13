// Shared state and functions
window.walletConnected = false;

// Show wallet overlay
window.showWalletOverlay = function() {
    const overlay = document.getElementById('wallet-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
};

// Show notification - expose globally
window.showNotification = function(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create notification content
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    // Add icon based on type
    const icon = document.createElement('i');
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    // Add message
    const text = document.createElement('span');
    text.textContent = message;
    
    // Assemble notification
    content.appendChild(icon);
    content.appendChild(text);
    notification.appendChild(content);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

// Add notification styles
document.head.appendChild(style = document.createElement('style'));
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: var(--background-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        border-left: 4px solid;
    }
    
    .notification.success {
        border-left-color: #4CAF50;
    }
    
    .notification.error {
        border-left-color: #f44336;
    }
    
    .notification.warning {
        border-left-color: #ff9800;
    }
    
    .notification.info {
        border-left-color: #2196F3;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification i {
        font-size: 20px;
    }
    
    .notification.success i {
        color: #4CAF50;
    }
    
    .notification.error i {
        color: #f44336;
    }
    
    .notification.warning i {
        color: #ff9800;
    }
    
    .notification.info i {
        color: #2196F3;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-color);
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        opacity: 0.5;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .notification.fade-out {
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`; 