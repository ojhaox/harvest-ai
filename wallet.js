// Wallet Connection and Balance Management
let walletAddress = null;
let solanaConnection = null;
let connectionInterval = null;

// List of public RPC endpoints
const RPC_ENDPOINTS = [
    'https://api.devnet.solana.com',  // Devnet for testing
    'https://solana-api.projectserum.com',  // Project Serum public endpoint
    'https://rpc.ankr.com/solana'  // Ankr public endpoint
];

// Initialize Solana connection
async function initializeSolana() {
    try {
        // Check if window.solana exists
        if (!window.solana) {
            console.warn("🔴 Solana object not found. Please install Phantom wallet.");
            return;
        }

        // Try connecting to each endpoint until one works
        for (const endpoint of RPC_ENDPOINTS) {
            try {
                solanaConnection = new window.solanaWeb3.Connection(
                    endpoint,
                    'confirmed'
                );
                // Test the connection
                await solanaConnection.getVersion();
                console.log("✅ Solana connection initialized using:", endpoint);
                break;
            } catch (err) {
                console.warn(`Failed to connect to ${endpoint}, trying next endpoint...`);
                continue;
            }
        }

        if (!solanaConnection) {
            throw new Error("Unable to connect to any Solana RPC endpoint");
        }

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
        window.walletConnected = true;
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
        
        if (window.walletConnected && balance !== null) {
            const formattedBalance = (balance / window.solanaWeb3.LAMPORTS_PER_SOL).toFixed(4);
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
    if (!window.walletConnected || !walletAddress || !solanaConnection) return;

    try {
        const balance = await solanaConnection.getBalance(new window.solanaWeb3.PublicKey(walletAddress));
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
        
        window.walletConnected = false;
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
        if (window.walletConnected) {
            await disconnectWallet();
            return;
        }

        // Connect to wallet
        const response = await window.solana.connect();
        walletAddress = response.publicKey.toString();
        window.walletConnected = true;

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

// Wallet connection manager
class WalletManager {
    constructor() {
        this.connectPhantomBtn = document.getElementById('connect-phantom');
        this.connectMetaMaskBtn = document.getElementById('connect-metamask');
        this.skipWalletBtn = document.getElementById('skip-wallet');
        this.walletOverlay = document.getElementById('wallet-overlay');
        this.walletButton = document.querySelector('.wallet-button');
        this.walletText = this.walletButton.querySelector('.wallet-text');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.connectPhantomBtn.addEventListener('click', () => this.connectPhantomWallet());
        this.connectMetaMaskBtn.addEventListener('click', () => this.connectMetaMaskWallet());
        this.skipWalletBtn.addEventListener('click', () => this.skipWallet());
        this.walletButton.addEventListener('click', () => this.toggleWalletOverlay());
    }

    // Check if Phantom is installed
    async isPhantomInstalled() {
        const provider = window?.solana;
        return !!provider?.isPhantom;
    }

    // Check if MetaMask is installed
    async isMetaMaskInstalled() {
        const provider = window?.ethereum;
        return !!provider && provider.isMetaMask;
    }

    // Connect to Phantom wallet
    async connectPhantomWallet() {
        try {
            // Check if Phantom is installed
            if (!await this.isPhantomInstalled()) {
                showNotification('Please install Phantom wallet first', 'error');
                window.open('https://phantom.app/', '_blank');
                return;
            }

            // Request wallet connection
            const provider = window.solana;
            
            // Request wallet permissions
            const resp = await provider.connect();
            
            // Handle successful connection
            window.walletAddress = resp.publicKey.toString();
            this.updateWalletUI(true);
            showNotification('Wallet connected successfully!', 'success');
            
            // Dispatch wallet connected event
            document.dispatchEvent(new CustomEvent('walletConnected', {
                detail: { address: window.walletAddress }
            }));

        } catch (error) {
            console.error('Phantom connection error:', error);
            showNotification('Failed to connect wallet: ' + error.message, 'error');
        }
    }

    // Connect to MetaMask wallet
    async connectMetaMaskWallet() {
        try {
            // Check if MetaMask is installed
            if (!await this.isMetaMaskInstalled()) {
                showNotification('Please install MetaMask wallet first', 'error');
                window.open('https://metamask.io/', '_blank');
                return;
            }

            // Request wallet connection
            const provider = window.ethereum;
            
            // Request account access
            const accounts = await provider.request({ 
                method: 'eth_requestAccounts' 
            });
            
            // Handle successful connection
            window.walletAddress = accounts[0];
            this.updateWalletUI(true);
            showNotification('Wallet connected successfully!', 'success');
            
            // Dispatch wallet connected event
            document.dispatchEvent(new CustomEvent('walletConnected', {
                detail: { address: window.walletAddress }
            }));

            // Listen for account changes
            provider.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    window.walletAddress = accounts[0];
                    this.updateWalletUI(true);
                }
            });

        } catch (error) {
            console.error('MetaMask connection error:', error);
            showNotification('Failed to connect wallet: ' + error.message, 'error');
        }
    }

    // Disconnect wallet
    disconnectWallet() {
        window.walletAddress = null;
        this.updateWalletUI(false);
        showNotification('Wallet disconnected', 'info');
        
        // Dispatch wallet disconnected event
        document.dispatchEvent(new Event('walletDisconnected'));
    }

    // Skip wallet connection
    skipWallet() {
        this.hideWalletOverlay();
        showNotification('Continuing without wallet. Some features will be limited.', 'info');
    }

    // Update wallet UI
    updateWalletUI(connected) {
        if (connected) {
            this.walletButton.classList.add('connected');
            this.walletText.textContent = `${window.walletAddress.slice(0, 4)}...${window.walletAddress.slice(-4)}`;
            this.hideWalletOverlay();
        } else {
            this.walletButton.classList.remove('connected');
            this.walletText.textContent = 'Connect Wallet';
        }
    }

    // Show wallet overlay
    showWalletOverlay() {
        this.walletOverlay.classList.remove('hidden');
    }

    // Hide wallet overlay
    hideWalletOverlay() {
        this.walletOverlay.classList.add('hidden');
    }

    // Toggle wallet overlay
    toggleWalletOverlay() {
        if (window.walletAddress) {
            this.disconnectWallet();
        } else {
            this.showWalletOverlay();
        }
    }
}

// Initialize wallet manager
const walletManager = new WalletManager();

// Check for existing wallet connections on page load
window.addEventListener('load', async () => {
    // Check Phantom
    if (await walletManager.isPhantomInstalled()) {
        const provider = window.solana;
        try {
            const resp = await provider.connect({ onlyIfTrusted: true });
            window.walletAddress = resp.publicKey.toString();
            walletManager.updateWalletUI(true);
        } catch (error) {
            // Not previously connected
        }
    }
    
    // Check MetaMask
    if (await walletManager.isMetaMaskInstalled()) {
        const provider = window.ethereum;
        try {
            const accounts = await provider.request({ 
                method: 'eth_accounts'
            });
            if (accounts.length > 0) {
                window.walletAddress = accounts[0];
                walletManager.updateWalletUI(true);
            }
        } catch (error) {
            // Not previously connected
        }
    }
}); 