// Wallet Connection and Balance Management
let walletConnected = false;
let walletAddress = null;
let solanaConnection = null;
let connectionInterval = null;

// Initialize Solana connection
async function initializeSolana() {
    try {
        solanaConnection = new solana.Connection("https://api.mainnet-beta.solana.com");
        console.log("✅ Solana connection initialized");
    } catch (error) {
        console.error("❌ Failed to initialize Solana connection:", error);
        showError("Failed to initialize Solana connection. Please refresh the page.");
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
    const walletButton = document.querySelector('.wallet-button');
    const walletText = walletButton.querySelector('.wallet-text');
    
    if (!walletButton || !walletText) return;
    
    if (walletConnected && balance !== null) {
        const formattedBalance = (balance / solana.LAMPORTS_PER_SOL).toFixed(4);
        walletText.textContent = `${formattedBalance} SOL`;
        walletButton.classList.add('connected');
    } else {
        walletText.textContent = 'Connect Wallet';
        walletButton.classList.remove('connected');
    }
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
        const { solana } = window;
        if (solana && solana.isConnected) {
            await solana.disconnect();
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
        const { solana } = window;
        
        if (!solana) {
            throw new Error("No Solana object found! Please install Phantom wallet.");
        }

        if (!solana.isPhantom) {
            throw new Error("Please install Phantom wallet!");
        }

        // If already connected, disconnect first
        if (walletConnected) {
            await disconnectWallet();
            return;
        }

        // Connect to wallet
        const response = await solana.connect();
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

    // Add click handler to wallet button
    const walletButton = document.querySelector('.wallet-button');
    if (walletButton) {
        walletButton.addEventListener('click', connectWallet);
    }

    // Add click handler to Phantom wallet option in overlay
    const connectPhantomBtn = document.getElementById('connect-phantom');
    if (connectPhantomBtn) {
        connectPhantomBtn.addEventListener('click', connectWallet);
    }

    // Check if wallet was previously connected
    const { solana } = window;
    if (solana && solana.isPhantom && solana.isConnected) {
        try {
            const response = await solana.connect({ onlyIfTrusted: true });
            walletAddress = response.publicKey.toString();
            walletConnected = true;
            await updateBalance();
            connectionInterval = setInterval(updateBalance, 30000);
        } catch (error) {
            console.error("❌ Failed to reconnect wallet:", error);
        }
    }
}); 