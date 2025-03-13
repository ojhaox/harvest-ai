// Wallet Connection and Balance Management
let walletConnected = false;
let walletAddress = null;
let solanaConnection = null;
let connectionInterval = null;

// Initialize Solana connection
async function initializeSolana() {
    try {
        // Check if window.solana exists
        if (!window.solana) {
            console.warn("🔴 Solana object not found. Please install Phantom wallet.");
            return;
        }

        // Initialize connection
        solanaConnection = new solana.Connection("https://api.mainnet-beta.solana.com");
        console.log("✅ Solana connection initialized");

        // Check if already connected
        if (window.solana.isConnected) {
            await autoConnectWallet();
        }
    } catch (error) {
        console.error("❌ Failed to initialize Solana connection:", error);
        showError("Failed to initialize Solana connection. Please refresh the page.");
    }
}

// Auto-connect if wallet is already authorized
async function autoConnectWallet() {
    try {
        const resp = await window.solana.connect({ onlyIfTrusted: true });
        walletAddress = resp.publicKey.toString();
        walletConnected = true;
        await updateBalance();
        connectionInterval = setInterval(updateBalance, 30000);
        console.log("✅ Wallet auto-connected:", walletAddress);
    } catch (error) {
        console.log("Info: Not auto-connecting wallet:", error.message);
    }
}

// Show error message to user
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'wallet-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Update wallet button with balance
async function updateWalletButton(balance) {
    const walletButtons = document.querySelectorAll('.wallet-button');
    
    walletButtons.forEach(walletButton => {
        const walletText = walletButton.querySelector('.wallet-text');
        
        if (!walletText) return;
        
        if (walletConnected && balance !== null) {
            const formattedBalance = (balance / solana.LAMPORTS_PER_SOL).toFixed(4);
            walletText.textContent = `${formattedBalance} SOL`;
            walletButton.classList.add('connected');
        } else {
            walletText.textContent = 'Connect Wallet';
            walletButton.classList.remove('connected');
        }
    });
}

// Fetch and update SOL balance
async function updateBalance() {
    if (!walletConnected || !walletAddress || !solanaConnection) return;

    try {
        const balance = await solanaConnection.getBalance(new solana.PublicKey(walletAddress));
        await updateWalletButton(balance);
    } catch (error) {
        console.error("❌ Failed to fetch balance:", error);
        updateWalletButton(null);
    }
}

// Disconnect wallet
async function disconnectWallet() {
    try {
        if (window.solana && window.solana.isConnected) {
            await window.solana.disconnect();
        }
        
        walletConnected = false;
        walletAddress = null;
        if (connectionInterval) {
            clearInterval(connectionInterval);
            connectionInterval = null;
        }
        
        updateWalletButton(null);
        console.log("✅ Wallet disconnected");
    } catch (error) {
        console.error("❌ Failed to disconnect wallet:", error);
        showError("Failed to disconnect wallet. Please try again.");
    }
}

// Connect wallet
async function connectWallet() {
    try {
        // Check if Phantom is installed
        if (!window.solana) {
            throw new Error("Please install Phantom wallet!");
        }

        if (!window.solana.isPhantom) {
            throw new Error("Please install Phantom wallet!");
        }

        // If already connected, disconnect first
        if (walletConnected) {
            await disconnectWallet();
            return;
        }

        // Connect to wallet
        const response = await window.solana.connect();
        walletAddress = response.publicKey.toString();
        walletConnected = true;

        // Initial balance update
        await updateBalance();

        // Set up balance refresh interval (every 30 seconds)
        connectionInterval = setInterval(updateBalance, 30000);

        // Hide wallet overlay if it exists
        const walletOverlay = document.getElementById('wallet-overlay');
        if (walletOverlay) {
            walletOverlay.classList.add('hidden');
        }

        console.log("✅ Wallet connected:", walletAddress);

    } catch (error) {
        console.error("❌ Failed to connect wallet:", error);
        showError(error.message);
    }
}

// Initialize wallet functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Solana connection
    await initializeSolana();

    // Add click handler to all wallet buttons
    const walletButtons = document.querySelectorAll('.wallet-button');
    walletButtons.forEach(button => {
        button.addEventListener('click', connectWallet);
    });

    // Add click handler to Phantom wallet option in overlay
    const connectPhantomBtn = document.getElementById('connect-phantom');
    if (connectPhantomBtn) {
        connectPhantomBtn.addEventListener('click', connectWallet);
    }

    // Add click handler to skip wallet button
    const skipWalletBtn = document.getElementById('skip-wallet');
    if (skipWalletBtn) {
        skipWalletBtn.addEventListener('click', () => {
            const walletOverlay = document.getElementById('wallet-overlay');
            if (walletOverlay) {
                walletOverlay.classList.add('hidden');
            }
        });
    }
}); 