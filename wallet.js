// Wallet Connection and Balance Management
let walletConnected = false;
let walletAddress = null;
let solanaConnection = null;

// Initialize Solana connection
async function initializeSolana() {
    try {
        solanaConnection = new solana.Connection("https://api.mainnet-beta.solana.com");
    } catch (error) {
        console.error("Failed to initialize Solana connection:", error);
    }
}

// Update wallet button with balance
async function updateWalletButton(balance) {
    const walletButton = document.querySelector('.wallet-button');
    const walletText = walletButton.querySelector('.wallet-text');
    
    if (walletConnected && balance !== null) {
        // Format balance to 4 decimal places
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
        console.error("Failed to fetch balance:", error);
        updateWalletButton(null);
    }
}

// Connect wallet
async function connectWallet() {
    try {
        // Check if Phantom is installed
        const { solana } = window;
        
        if (!solana?.isPhantom) {
            throw new Error("Please install Phantom wallet!");
        }

        // Connect to wallet
        const response = await solana.connect();
        walletAddress = response.publicKey.toString();
        walletConnected = true;

        // Initial balance update
        await updateBalance();

        // Set up balance refresh interval (every 30 seconds)
        setInterval(updateBalance, 30000);

        // Hide wallet overlay if it exists
        const walletOverlay = document.getElementById('wallet-overlay');
        if (walletOverlay) {
            walletOverlay.classList.add('hidden');
        }

    } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert(error.message);
    }
}

// Initialize wallet functionality
document.addEventListener('DOMContentLoaded', async () => {
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
}); 