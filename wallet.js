// Wallet Connection and Balance Management
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
                window.solanaConnection = new window.solanaWeb3.Connection(
                    endpoint,
                    'confirmed'
                );
                // Test the connection
                await window.solanaConnection.getVersion();
                console.log("✅ Solana connection initialized using:", endpoint);
                break;
            } catch (err) {
                console.warn(`Failed to connect to ${endpoint}, trying next endpoint...`);
                continue;
            }
        }

        if (!window.solanaConnection) {
            throw new Error("Unable to connect to any Solana RPC endpoint");
        }
    } catch (error) {
        console.error("❌ Failed to initialize Solana connection:", error);
        // Use setTimeout to prevent potential recursion
        setTimeout(() => {
            window.showNotification("Failed to initialize Solana connection. Please refresh the page.", 'error');
        }, 0);
    }
}

// Wallet Manager Class
class WalletManager {
    constructor() {
        // Initialize with null values
        this.connectPhantomBtn = document.getElementById('connect-phantom');
        this.connectMetaMaskBtn = document.getElementById('connect-metamask');
        this.skipWalletBtn = document.getElementById('skip-wallet');
        this.walletOverlay = document.getElementById('wallet-overlay');
        this.walletButton = document.querySelector('.wallet-button');
        this.walletText = this.walletButton?.querySelector('.wallet-text');
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Do NOT automatically connect - let user initiate connection
        this.walletConnected = false;
        this.walletAddress = null;
        this.walletType = null;
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Wallet connect button in navbar
        if (this.walletButton) {
            this.walletButton.addEventListener('click', () => this.showWalletOverlay());
        }

        // Phantom wallet connect button
        if (this.connectPhantomBtn) {
            this.connectPhantomBtn.addEventListener('click', () => this.connectPhantomWallet());
        }

        // MetaMask wallet connect button
        if (this.connectMetaMaskBtn) {
            this.connectMetaMaskBtn.addEventListener('click', () => this.connectMetaMaskWallet());
        }

        // Skip wallet button
        if (this.skipWalletBtn) {
            this.skipWalletBtn.addEventListener('click', () => this.skipWallet());
        }
    }

    // Show wallet connection overlay
    showWalletOverlay() {
        if (this.walletOverlay) {
            this.walletOverlay.classList.remove('hidden');
        }
    }

    // Hide wallet connection overlay
    hideWalletOverlay() {
        if (this.walletOverlay) {
            this.walletOverlay.classList.add('hidden');
        }
    }

    // Update wallet UI
    updateWalletUI() {
        if (this.walletText) {
            if (this.walletConnected && this.walletAddress) {
                // Show shortened wallet address
                const shortAddress = `${this.walletAddress.slice(0, 4)}...${this.walletAddress.slice(-4)}`;
                this.walletText.textContent = shortAddress;
                this.walletButton.classList.add('connected');
            } else {
                this.walletText.textContent = 'Connect Wallet';
                this.walletButton.classList.remove('connected');
            }
        }
    }

    // Connect Phantom wallet
    async connectPhantomWallet() {
        try {
            // Check if Phantom is installed
            const provider = window?.solana;
            if (!provider || !provider.isPhantom) {
                if (confirm('Phantom wallet is not installed. Would you like to install it now?')) {
                    window.open('https://phantom.app/', '_blank');
                }
                return;
            }

            // Request connection
            const response = await window.solana.connect();
            this.walletAddress = response.publicKey.toString();
            this.walletConnected = true;
            this.walletType = 'phantom';
            
            // Update UI
            this.updateWalletUI();
            this.hideWalletOverlay();
            
            // Show success notification
            window.showNotification('Phantom wallet connected successfully!', 'success');

            // Set up disconnect event listener
            window.solana.on('disconnect', () => {
                this.disconnectWallet();
                window.showNotification('Phantom wallet disconnected', 'info');
            });

        } catch (error) {
            console.error('Error connecting Phantom wallet:', error);
            window.showNotification('Failed to connect Phantom wallet. Please try again.', 'error');
        }
    }

    // Connect MetaMask wallet
    async connectMetaMaskWallet() {
        try {
            // Check if MetaMask is installed
            const provider = window?.ethereum;
            if (!provider || !provider.isMetaMask) {
                if (confirm('MetaMask is not installed. Would you like to install it now?')) {
                    window.open('https://metamask.io/', '_blank');
                }
                return;
            }

            // Request connection
            const accounts = await provider.request({
                method: 'eth_requestAccounts'
            });
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned from MetaMask');
            }
            
            this.walletAddress = accounts[0];
            this.walletConnected = true;
            this.walletType = 'metamask';
            
            // Update UI
            this.updateWalletUI();
            this.hideWalletOverlay();
            
            // Show success notification
            window.showNotification('MetaMask wallet connected successfully!', 'success');
            
            // Set up account change and disconnect listeners
            provider.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    this.walletAddress = accounts[0];
                    this.updateWalletUI();
                }
            });

        } catch (error) {
            console.error('Error connecting MetaMask wallet:', error);
            if (error.code === 4001) {
                window.showNotification('Wallet connection was rejected. Please try again.', 'warning');
            } else {
                window.showNotification('Failed to connect MetaMask wallet. Please try again.', 'error');
            }
        }
    }

    // Skip wallet connection
    skipWallet() {
        this.hideWalletOverlay();
        window.showNotification('Continuing without wallet connection', 'info');
    }

    // Disconnect wallet
    disconnectWallet() {
        try {
            // Disconnect from provider if possible
            if (this.walletType === 'phantom' && window.solana) {
                window.solana.disconnect();
            }
            
            // Reset state
            this.walletConnected = false;
            this.walletAddress = null;
            this.walletType = null;
            
            // Update UI
            this.updateWalletUI();
            
            // Show notification
            window.showNotification('Wallet disconnected successfully', 'info');
            
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            window.showNotification('Error disconnecting wallet', 'error');
        }
    }
}

// Initialize wallet manager
window.addEventListener('DOMContentLoaded', () => {
    window.walletManager = new WalletManager();
}); 