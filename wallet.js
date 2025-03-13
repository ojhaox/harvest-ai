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

// Wallet connection manager
class WalletManager {
    constructor() {
        // Initialize with null values
        this.connectPhantomBtn = null;
        this.connectMetaMaskBtn = null;
        this.skipWalletBtn = null;
        this.walletOverlay = null;
        this.walletButton = null;
        this.walletText = null;
        
        // Try to find elements
        this.initializeElements();
        
        // Only initialize event listeners if required elements exist
        if (this.hasRequiredElements()) {
            this.initializeEventListeners();
        } else {
            console.warn('Some wallet UI elements are missing. Wallet functionality may be limited.');
        }

        // Initialize Solana connection
        initializeSolana();
    }

    // Initialize DOM elements
    initializeElements() {
        this.connectPhantomBtn = document.getElementById('connect-phantom');
        this.connectMetaMaskBtn = document.getElementById('connect-metamask');
        this.skipWalletBtn = document.getElementById('skip-wallet');
        this.walletOverlay = document.getElementById('wallet-overlay');
        this.walletButton = document.querySelector('.wallet-button');
        this.walletText = this.walletButton?.querySelector('.wallet-text');
    }

    // Check if all required elements exist
    hasRequiredElements() {
        return (
            this.connectPhantomBtn &&
            this.connectMetaMaskBtn &&
            this.skipWalletBtn &&
            this.walletOverlay &&
            this.walletButton &&
            this.walletText
        );
    }

    initializeEventListeners() {
        if (this.connectPhantomBtn) {
            this.connectPhantomBtn.addEventListener('click', () => this.connectPhantomWallet());
        }
        
        if (this.connectMetaMaskBtn) {
            this.connectMetaMaskBtn.addEventListener('click', () => this.connectMetaMaskWallet());
        }
        
        if (this.skipWalletBtn) {
            this.skipWalletBtn.addEventListener('click', () => this.skipWallet());
        }
        
        if (this.walletButton) {
            this.walletButton.addEventListener('click', () => this.toggleWalletOverlay());
        }
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

    // Update balance display
    async updateBalance() {
        if (!window.walletConnected || !window.walletAddress || !window.solanaConnection) return;

        try {
            const balance = await window.solanaConnection.getBalance(
                new window.solanaWeb3.PublicKey(window.walletAddress)
            );
            const formattedBalance = (balance / window.solanaWeb3.LAMPORTS_PER_SOL).toFixed(4);
            
            if (this.walletText) {
                this.walletText.textContent = `${formattedBalance} SOL`;
            }
        } catch (error) {
            console.error("❌ Failed to fetch balance:", error);
            if (this.walletText) {
                this.walletText.textContent = 'Error';
            }
        }
    }

    // Connect to Phantom wallet
    async connectPhantomWallet() {
        try {
            // Check if Phantom is installed
            const provider = window?.solana;
            if (!provider) {
                setTimeout(() => {
                    window.showNotification('Please install Phantom wallet first', 'error');
                }, 0);
                window.open('https://phantom.app/', '_blank');
                return;
            }

            // Force disconnect first to ensure fresh connection
            try {
                await provider.disconnect();
            } catch (e) {
                // Ignore disconnect errors
            }

            // Request new connection - this will trigger the popup
            const resp = await provider.connect();
            
            // Handle successful connection
            window.walletAddress = resp.publicKey.toString();
            window.walletConnected = true;
            
            // Update UI
            this.updateWalletUI(true);
            await this.updateBalance();
            
            // Set up balance refresh interval
            if (connectionInterval) clearInterval(connectionInterval);
            connectionInterval = setInterval(() => this.updateBalance(), 30000);
            
            // Show success message
            setTimeout(() => {
                window.showNotification('Wallet connected successfully!', 'success');
            }, 0);
            
            // Dispatch wallet connected event
            document.dispatchEvent(new CustomEvent('walletConnected', {
                detail: { address: window.walletAddress }
            }));

        } catch (error) {
            console.error('Phantom connection error:', error);
            setTimeout(() => {
                window.showNotification('Failed to connect wallet: ' + error.message, 'error');
            }, 0);
        }
    }

    // Connect to MetaMask wallet
    async connectMetaMaskWallet() {
        try {
            // Check if MetaMask is installed
            const provider = window?.ethereum;
            if (!provider || !provider.isMetaMask) {
                setTimeout(() => {
                    window.showNotification('Please install MetaMask wallet first', 'error');
                }, 0);
                window.open('https://metamask.io/', '_blank');
                return;
            }

            // Force disconnect by clearing any existing connections
            try {
                await provider.request({
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }]
                });
            } catch (e) {
                // Ignore permission request errors
            }

            // Request new account access - this will trigger the popup
            const accounts = await provider.request({
                method: 'eth_requestAccounts',
                params: []
            });
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned from MetaMask');
            }
            
            // Handle successful connection
            window.walletAddress = accounts[0];
            window.walletConnected = true;
            this.updateWalletUI(true);
            setTimeout(() => {
                window.showNotification('Wallet connected successfully!', 'success');
            }, 0);
            
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
            setTimeout(() => {
                window.showNotification('Failed to connect wallet: ' + error.message, 'error');
            }, 0);
        }
    }

    // Disconnect wallet
    async disconnectWallet() {
        try {
            // Disconnect Phantom if connected
            if (window.solana?.isConnected) {
                await window.solana.disconnect();
            }
            
            // Clear connection state
            window.walletConnected = false;
            window.walletAddress = null;
            
            // Clear balance refresh interval
            if (connectionInterval) {
                clearInterval(connectionInterval);
                connectionInterval = null;
            }
            
            // Update UI
            this.updateWalletUI(false);
            setTimeout(() => {
                window.showNotification('Wallet disconnected', 'info');
            }, 0);
            
            // Dispatch wallet disconnected event
            document.dispatchEvent(new Event('walletDisconnected'));
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            setTimeout(() => {
                window.showNotification('Failed to disconnect wallet: ' + error.message, 'error');
            }, 0);
        }
    }

    // Skip wallet connection
    skipWallet() {
        this.hideWalletOverlay();
        window.showNotification('Continuing without wallet. Some features will be limited.', 'info');
    }

    // Update wallet UI
    updateWalletUI(connected) {
        if (!this.walletButton || !this.walletText) {
            console.warn('Wallet UI elements not found. Cannot update UI.');
            return;
        }

        if (connected && window.walletAddress) {
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
        if (this.walletOverlay) {
            this.walletOverlay.classList.remove('hidden');
        }
    }

    // Hide wallet overlay
    hideWalletOverlay() {
        if (this.walletOverlay) {
            this.walletOverlay.classList.add('hidden');
        }
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

// Initialize wallet manager only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.walletManager = new WalletManager();
}); 