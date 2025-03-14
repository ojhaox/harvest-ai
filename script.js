// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (anchors) {
        anchors.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Initialize other event listeners only after DOM is loaded
    initializeNavbar();
    initializeObserver();
    initializeCTAButton();
    initializeWalletConnection();
    initializeChat();
    
    // Check if user previously skipped wallet connection
    const walletSkipped = localStorage.getItem('walletConnectionSkipped') === 'true';
    if (walletSkipped) {
        const walletButton = document.querySelector('.wallet-button');
        if (walletButton) {
            walletButton.classList.add('wallet-skipped');
        }
    }

    // Remove custom cursor initialization
    // Only initialize cursor if not on mobile
    if (window.innerWidth > 768) {
        // Remove cursor-related code
    }

    // Initialize other features
    initializeMobileMenu();
    updateLogoChatPosition();
    
    // Update logo chat position on window resize
    window.addEventListener('resize', updateLogoChatPosition);
    
    // Check if wallet is already connected
    checkWalletConnection();
});

// Function declarations
function showWalletOverlay() {
    const overlay = document.getElementById('wallet-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">
                ${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Information'}
            </div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
}

// Initialize global state on window object
window.walletConnected = false;
window.showWalletOverlay = showWalletOverlay;
window.showNotification = showNotification;

// Wallet connection state
let walletType = null; // 'phantom' or 'metamask'
let walletAddress = null;

// Check if wallet is already connected
function checkWalletConnection() {
    // Check localStorage for saved connection
    const savedWallet = localStorage.getItem('harvestWallet');
    
    if (savedWallet) {
        const walletData = JSON.parse(savedWallet);
        walletType = walletData.type;
        walletAddress = walletData.address;
        
        // Verify the connection is still active
        if (walletType === 'phantom') {
            verifyPhantomConnection();
        } else if (walletType === 'metamask') {
            verifyMetamaskConnection();
        }
    } else {
        // Show wallet overlay if no connection found
        showWalletOverlay();
    }
}

// Verify Phantom connection
async function verifyPhantomConnection() {
    if (window.solana && window.solana.isPhantom) {
        try {
            // Check if already connected
            const response = await window.solana.connect({ onlyIfTrusted: true });
            walletAddress = response.publicKey.toString();
            walletConnected = true;
            walletType = 'phantom';
            
            // Save connection
            saveWalletConnection();
            
            // Update UI
            updateWalletUI();
            hideWalletOverlay();
        } catch (error) {
            console.log('Phantom not connected:', error);
            showWalletOverlay();
        }
    } else {
        showWalletOverlay();
    }
}

// Verify Metamask connection
async function verifyMetamaskConnection() {
    if (window.ethereum) {
        try {
            // Check if already connected
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            
            if (accounts.length > 0) {
                walletAddress = accounts[0];
                walletConnected = true;
                walletType = 'metamask';
                
                // Save connection
                saveWalletConnection();
                
                // Update UI
                updateWalletUI();
                hideWalletOverlay();
            } else {
                showWalletOverlay();
            }
        } catch (error) {
            console.log('Metamask not connected:', error);
            showWalletOverlay();
        }
    } else {
        showWalletOverlay();
    }
}

// Save wallet connection to localStorage
function saveWalletConnection() {
    const walletData = {
        type: walletType,
        address: walletAddress
    };
    
    localStorage.setItem('harvestWallet', JSON.stringify(walletData));
    
    // Update global state
    window.walletConnected = walletConnected;
}

// Hide wallet overlay
function hideWalletOverlay() {
    const overlay = document.getElementById('wallet-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Wallet connection initialization
function initializeWalletConnection() {
    // Connect wallet button in navbar
    const walletButton = document.querySelector('.wallet-button');
    if (walletButton) {
        walletButton.addEventListener('click', handleWalletButtonClick);
    }
    
    // Phantom wallet connection
    const phantomButton = document.getElementById('connect-phantom');
    if (phantomButton) {
        phantomButton.addEventListener('click', connectPhantomWallet);
    }
    
    // Metamask wallet connection
    const metamaskButton = document.getElementById('connect-metamask');
    if (metamaskButton) {
        metamaskButton.addEventListener('click', connectMetamaskWallet);
    }
    
    // Skip wallet connection
    const skipWalletButton = document.getElementById('skip-wallet');
    if (skipWalletButton) {
        skipWalletButton.addEventListener('click', skipWalletConnection);
    }
}

// Handle wallet button click
function handleWalletButtonClick() {
    if (walletConnected) {
        // If already connected, show disconnect option
        if (confirm('Do you want to disconnect your wallet?')) {
            disconnectWallet();
        }
    } else {
        // If not connected, show connection overlay
        showWalletOverlay();
    }
}

// Connect Phantom wallet
async function connectPhantomWallet() {
    if (!window.solana) {
        // Phantom not installed
        if (confirm('Phantom wallet is not installed. Would you like to install it now?')) {
            window.open('https://phantom.app/', '_blank');
        }
        return;
    }
    
    try {
        const response = await window.solana.connect();
        walletAddress = response.publicKey.toString();
        walletConnected = true;
        walletType = 'phantom';
        
        // Save connection
        saveWalletConnection();
        
        // Update UI
        updateWalletUI();
        hideWalletOverlay();
        
        // Show success notification
        showNotification('Phantom wallet connected successfully!', 'success');
    } catch (error) {
        console.error('Error connecting Phantom wallet:', error);
        showNotification('Failed to connect Phantom wallet. Please try again.', 'error');
    }
}

// Connect Metamask wallet
async function connectMetamaskWallet() {
    if (!window.ethereum) {
        // Metamask not installed
        if (confirm('MetaMask is not installed. Would you like to install it now?')) {
            window.open('https://metamask.io/', '_blank');
        }
        return;
    }
    
    try {
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        walletAddress = accounts[0];
        walletConnected = true;
        walletType = 'metamask';
        
        // Save connection
        saveWalletConnection();
        
        // Update UI
        updateWalletUI();
        hideWalletOverlay();
        
        // Show success notification
        showNotification('MetaMask wallet connected successfully!', 'success');
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    } catch (error) {
        console.error('Error connecting MetaMask wallet:', error);
        showNotification('Failed to connect MetaMask wallet. Please try again.', 'error');
    }
}

// Handle account changes in Metamask
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
    } else {
        // User switched accounts
        walletAddress = accounts[0];
        saveWalletConnection();
        updateWalletUI();
    }
}

// Disconnect wallet
function disconnectWallet() {
    // Reset wallet state
    walletConnected = false;
    walletAddress = '';
    
    // Update UI
    updateWalletButtonText();
    
    // Show toast notification
    showToast('Wallet disconnected successfully', 'success');
}

// Skip wallet connection
function skipWalletConnection() {
    // Hide the wallet overlay
    hideWalletOverlay();
    
    // Set a flag to remember user's preference
    localStorage.setItem('walletConnectionSkipped', 'true');
    
    // Show toast notification
    showToast('Continuing without wallet connection', 'info');
    
    // Update UI to show limited functionality
    const walletButton = document.querySelector('.wallet-button');
    if (walletButton) {
        walletButton.innerHTML = '<i class="fas fa-wallet"></i><span class="wallet-text">Connect Wallet</span>';
        walletButton.classList.add('wallet-skipped');
    }
}

// Update wallet UI
function updateWalletUI() {
    const walletBtn = document.querySelector('.wallet-button');
    const walletText = walletBtn.querySelector('.wallet-text');
    
    if (walletConnected && walletAddress) {
        walletBtn.classList.add('connected');
        // Format address for display (first 4 and last 4 characters)
        const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
        walletText.textContent = shortAddress;
    } else {
        walletBtn.classList.remove('connected');
        walletText.textContent = 'Connect Wallet';
    }
}

// Navbar initialization
function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.9)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
}

// Observer initialization
function initializeObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all about cards
    const aboutCards = document.querySelectorAll('.about-card');
    if (aboutCards) {
        aboutCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });
    }
}

// CTA button initialization
function initializeCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseover', () => {
            ctaButton.style.transform = 'translateY(-3px)';
            ctaButton.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });

        ctaButton.addEventListener('mouseout', () => {
            ctaButton.style.transform = 'translateY(0)';
            ctaButton.style.boxShadow = 'none';
        });
    }
}

// AI Chatbot Functionality
function initializeChat() {
    const chatWidget = document.querySelector('.chat-widget');
    const chatHeader = document.querySelector('.chat-header');
    const chatBody = document.querySelector('.chat-body');
    const chatInput = document.querySelector('.chat-input');
    const chatSendBtn = document.querySelector('.chat-send-btn');
    const chatSuggestions = document.querySelectorAll('.chat-suggestion');

    // Only initialize chat if elements exist
    if (chatWidget && chatHeader && chatBody && chatInput && chatSendBtn) {
        // Toggle chat widget
        chatHeader.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
        });

        // Handle sending messages
        function sendMessage(message, isUser = true) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
            messageDiv.textContent = message;
            chatBody.appendChild(messageDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
            
            if (isUser) {
                showTypingIndicator();
                setTimeout(() => respondToMessage(message), 1000);
            }
        }

        // Show typing indicator
        function showTypingIndicator() {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'chat-loading';
            loadingDiv.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;
            chatBody.appendChild(loadingDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // Remove typing indicator
        function removeTypingIndicator() {
            const loadingDiv = document.querySelector('.chat-loading');
            if (loadingDiv) loadingDiv.remove();
        }

        // AI responses based on user input
        function respondToMessage(message) {
            removeTypingIndicator();
            const lowerMessage = message.toLowerCase();
            let response = '';

            if (lowerMessage.includes('deploy') || lowerMessage.includes('create') || lowerMessage.includes('new token')) {
                response = "Great! Let's help you deploy your token. First, I'll need some basic information:\n1. Token Name\n2. Token Symbol\n3. Initial Supply\n\nWhat's your token name? ????";
            } else if (lowerMessage.includes('feature') || lowerMessage.includes('can')) {
                response = "I can help you with the following token features:\n??? Mintable/Burnable\n??? Pausable\n??? Access Control\n??? Deflationary Mechanics\n\nWhich feature interests you? ???";
            } else if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
                response = "I'll run a comprehensive security check for your token. This includes:\n??? Code Audit\n??? Vulnerability Scanning\n??? Best Practices Review\n\nWould you like to proceed with the security check? ???????";
            } else {
                response = "I'm here to help with token deployment! You can ask me about:\n??? Deploying new tokens\n??? Token features\n??? Security checks\n\nWhat would you like to know? ????";
            }

            sendMessage(response, false);
        }

        // Handle send button click
        chatSendBtn.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                sendMessage(message);
                chatInput.value = '';
            }
        });

        // Handle enter key press
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = chatInput.value.trim();
                if (message) {
                    sendMessage(message);
                    chatInput.value = '';
                }
            }
        });

        // Handle suggestion clicks
        chatSuggestions.forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                sendMessage(suggestion.textContent);
            });
        });
    }
}

// Market Statistics Updates
function waitForEthers() {
    return new Promise((resolve) => {
        const checkEthers = () => {
            if (window.ethers) {
                console.log('Ethers.js loaded successfully');
                resolve();
            } else {
                console.log('Waiting for ethers.js to load...');
                setTimeout(checkEthers, 100);
            }
        };
        checkEthers();
    });
}

async function updateMarketStats() {
    try {
        console.log('Updating market statistics...');

        // Update UI to show loading state
        document.getElementById('eth-price').textContent = 'Loading...';
        document.getElementById('gas-low').textContent = 'Loading...';
        document.getElementById('gas-avg').textContent = 'Loading...';
        document.getElementById('gas-high').textContent = 'Loading...';
        document.getElementById('block-number').textContent = 'Loading...';

        // Get ETH Price from multiple sources
        async function getETHPrice() {
            try {
                // Try CoinGecko first
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                const data = await response.json();
                if (data.ethereum && data.ethereum.usd) {
                    return data.ethereum.usd;
                }
            } catch (error) {
                console.log('CoinGecko API failed, trying alternative...');
            }

            try {
                // Fallback to Binance API
                const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
                const data = await response.json();
                if (data.price) {
                    return parseFloat(data.price);
                }
            } catch (error) {
                console.log('Binance API failed');
                throw new Error('Failed to fetch ETH price');
            }
        }

        // Get Gas Prices from multiple sources
        async function getGasPrices() {
            try {
                // Try Etherscan API (no key required for this endpoint)
                const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
                const data = await response.json();
                if (data.result) {
                    return {
                        low: parseInt(data.result.SafeGasPrice),
                        average: parseInt(data.result.ProposeGasPrice),
                        high: parseInt(data.result.FastGasPrice)
                    };
                }
            } catch (error) {
                console.log('Etherscan API failed, trying alternative...');
            }

            try {
                // Fallback to Blocknative API
                const response = await fetch('https://api.blocknative.com/gasprices/blockprices', {
                    headers: {
                        'Authorization': ''  // No auth required for basic estimates
                    }
                });
                const data = await response.json();
                if (data.blockPrices && data.blockPrices[0]) {
                    const estimates = data.blockPrices[0].estimatedPrices[0];
                    return {
                        low: Math.round(estimates.price * 0.8),
                        average: Math.round(estimates.price),
                        high: Math.round(estimates.price * 1.2)
                    };
                }
            } catch (error) {
                console.log('Blocknative API failed');
            }

            // If both APIs fail, use ethers.js as final fallback
            const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.public.blastapi.io');
            const gasPrice = await provider.getGasPrice();
            const gasPriceInGwei = Math.round(Number(ethers.utils.formatUnits(gasPrice, "gwei")));
            return {
                low: Math.max(1, Math.round(gasPriceInGwei * 0.8)),
                average: gasPriceInGwei,
                high: Math.round(gasPriceInGwei * 1.2)
            };
        }

        // Get Block Number from multiple sources
        async function getBlockNumber() {
            const providers = [
                'https://eth-mainnet.public.blastapi.io',
                'https://rpc.ankr.com/eth',
                'https://ethereum.publicnode.com',
                'https://cloudflare-eth.com'
            ];

            for (const rpcUrl of providers) {
                try {
                    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                    return await provider.getBlockNumber();
                } catch (error) {
                    console.log(`Failed to get block number from ${rpcUrl}`);
                    continue;
                }
            }
            throw new Error('Failed to get block number from all providers');
        }

        // Fetch all data concurrently
        const [ethPrice, gasPrices, blockNumber] = await Promise.all([
            getETHPrice(),
            getGasPrices(),
            getBlockNumber()
        ]);

        // Update UI with fetched data
        if (ethPrice) {
            document.getElementById('eth-price').textContent = `$${ethPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        if (gasPrices) {
            document.getElementById('gas-low').textContent = `${gasPrices.low} Gwei`;
            document.getElementById('gas-avg').textContent = `${gasPrices.average} Gwei`;
            document.getElementById('gas-high').textContent = `${gasPrices.high} Gwei`;
        }

        if (blockNumber) {
            document.getElementById('block-number').textContent = `#${blockNumber.toLocaleString()}`;
        }

    } catch (error) {
        console.error('Error updating market stats:', error);
        // Keep the last successful values if available, otherwise show error state
        const elements = ['eth-price', 'gas-low', 'gas-avg', 'gas-high', 'block-number'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element.textContent === 'Loading...') {
                element.textContent = '--';
            }
        });
    }
}

// Initialize market stats
async function initializeMarketStats() {
    console.log('Initializing market statistics...');
    try {
        // Initial update
        await updateMarketStats();
        // Set up periodic updates
        setInterval(updateMarketStats, 30000); // Update every 30 seconds
    } catch (error) {
        console.error('Failed to initialize market stats:', error);
        // Retry initialization after 5 seconds
        setTimeout(initializeMarketStats, 5000);
    }
}

// Start updates when the page is loaded
window.addEventListener('load', initializeMarketStats);

// Add loading animation to market stats
const marketCards = document.querySelectorAll('.market-card');
marketCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = 'var(--thunder-glow)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'var(--glow)';
    });
});

// Feature Tags Animation
const featureTags = document.querySelectorAll('.feature-tag');
featureTags.forEach((tag, index) => {
    tag.style.animationDelay = `${index * 0.2}s`;
});

// Step Cards Hover Effect
const stepCards = document.querySelectorAll('.step-card');
stepCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.boxShadow = 'var(--thunder-glow)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'var(--glow)';
    });
}); 

// Logo Chat Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all required elements
    const elements = {
        container: document.querySelector('.logo-chat'),
        input: document.querySelector('.logo-chat-input'),
        messages: document.querySelector('.logo-chat-messages'),
        sendButton: document.querySelector('.send-logo-prompt')
    };

    // Check if any required elements are missing
    const missingElements = Object.entries(elements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);

    if (missingElements.length > 0) {
        console.warn('Logo chat elements not found:', missingElements.join(', '));
        return;
    }

    // Add message to chat
    function addMessage(message, isUser = false, isImage = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `logo-chat-message ${isUser ? 'user' : 'ai'}`;
        
        if (isImage) {
            const img = document.createElement('img');
            img.src = message;
            img.alt = 'Generated Logo';
            messageDiv.appendChild(img);
        } else {
            messageDiv.textContent = message;
        }
        
        elements.messages.appendChild(messageDiv);
        elements.messages.scrollTop = elements.messages.scrollHeight;
    }

    // Handle send button click
    elements.sendButton.addEventListener('click', function() {
        const prompt = elements.input.value.trim();
        if (prompt) {
            addMessage(prompt, true);
            elements.input.value = '';

            // Simulate AI processing
            addMessage('Generating your logo based on the description... 🎨');
            setTimeout(() => {
                const logoUrl = generateLogoFromPrompt(prompt.toLowerCase());
                addMessage(logoUrl, false, true);  // Add the logo as an image in the chat
                addMessage('Here\'s your generated logo! How do you like it? Feel free to describe any adjustments. ✨');
            }, 1500);
        }
    });

    // Handle enter key press
    elements.input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            elements.sendButton.click();
        }
    });

    // Add initial welcome message
    addMessage('Hello! I\'m your AI logo designer. Describe your dream logo, and I\'ll create it for you! 🎨');
    addMessage('Try something like: "Create a modern tech logo with blue and white colors" 💡');
});

// Mobile Menu Toggle
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '??' : '???';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.textContent = '???';
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.textContent = '???';
            });
        });
    }
}

// Update logo chat positioning for mobile
function updateLogoChatPosition() {
    const logoChatContainer = document.querySelector('.logo-chat');
    if (logoChatContainer) {
        if (window.innerWidth <= 768) {
            logoChatContainer.style.position = 'fixed';
            logoChatContainer.style.bottom = '20px';
            logoChatContainer.style.right = '20px';
            logoChatContainer.style.width = '90%';
            logoChatContainer.style.maxWidth = '400px';
            logoChatContainer.style.maxHeight = '80vh';
        } else {
            logoChatContainer.style.position = 'fixed';
            logoChatContainer.style.right = '30px';
            logoChatContainer.style.top = '100px';
            logoChatContainer.style.width = '400px';
            logoChatContainer.style.maxWidth = '90vw';
        }
    }
}

// Constants
const TWITTER_API_ENDPOINT = 'https://api.twitter.com/2';
const SOLANA_NETWORK = 'mainnet-beta';
const JUPITER_API_ENDPOINT = 'https://quote-api.jup.ag/v6';

// State Management
let trackedKOLs = new Map();
let activeTraders = new Set();
let sentimentThreshold = 75;
let maxTradeSize = 1; // in SOL
let riskLevel = 'moderate';
let connection;
let wallet;

// Initialize Solana Connection
async function initializeSolana() {
    try {
        connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl(SOLANA_NETWORK),
            'confirmed'
        );
        console.log('Solana connection established');
    } catch (error) {
        console.error('Failed to initialize Solana connection:', error);
    }
}

// KOL Management
async function addKOL(twitterHandle) {
    if (!twitterHandle) return;
    
    // Check if wallet is connected
    if (!walletConnected) {
        showNotification('Please connect your wallet to manage KOLs', 'error');
        showWalletOverlay();
        return;
    }
    
    try {
        const userData = await fetchTwitterUserData(twitterHandle);
        trackedKOLs.set(userData.id, {
            handle: twitterHandle,
            lastTweetId: null,
            active: true,
            sentiment: 0
        });
        updateKOLUI();
        startTracking(userData.id);
        
        // Show success notification
        showNotification(`Added ${twitterHandle} to your KOL list`, 'success');
    } catch (error) {
        console.error('Error adding KOL:', error);
        showNotification(`Failed to add KOL: ${error.message}`, 'error');
    }
}

async function removeKOL(userId) {
    // Check if wallet is connected
    if (!walletConnected) {
        showNotification('Please connect your wallet to manage KOLs', 'error');
        showWalletOverlay();
        return;
    }
    
    trackedKOLs.delete(userId);
    updateKOLUI();
    
    // Show notification
    showNotification('KOL removed from your tracking list', 'info');
}

// Tweet Monitoring
async function startTracking(userId) {
    if (!trackedKOLs.has(userId)) return;
    
    setInterval(async () => {
        try {
            const tweets = await fetchLatestTweets(userId);
            if (tweets.length > 0) {
                processTweets(tweets, userId);
            }
        } catch (error) {
            console.error('Error fetching tweets:', error);
        }
    }, 30000); // Check every 30 seconds
}

async function processTweets(tweets, userId) {
    const kol = trackedKOLs.get(userId);
    if (!kol) return;

    for (const tweet of tweets) {
        if (kol.lastTweetId && tweet.id <= kol.lastTweetId) continue;

        const sentiment = await analyzeTweetSentiment(tweet.text);
        if (sentiment >= sentimentThreshold) {
            const tokens = extractTokenMentions(tweet.text);
            for (const token of tokens) {
                if (validateToken(token)) {
                    executeTrade(token);
                }
            }
        }

        kol.lastTweetId = tweet.id;
        updateTweetUI(tweet, sentiment);
    }
}

// Sentiment Analysis
async function analyzeTweetSentiment(text) {
    // Implement sentiment analysis using AI/ML
    // This is a placeholder - you would typically use a service like OpenAI or your own model
    return new Promise((resolve) => {
        // Simulate sentiment analysis
        const sentiment = Math.random() * 100;
        resolve(sentiment);
    });
}

// Token Validation and Trading
function validateToken(token) {
    // Implement token validation logic
    // Check if token exists on Solana
    // Verify liquidity, market cap, etc.
    return true;
}

async function executeTrade(token) {
    if (!walletConnected) {
        showNotification('Please connect your wallet to execute trades', 'error');
        showWalletOverlay();
        return;
    }

    try {
        // Get best route from Jupiter aggregator
        const route = await getJupiterRoute(token);
        if (!route) return;

        // Execute the trade
        const signature = await sendTransaction(route);
        if (signature) {
            updateTradeUI({
                token,
                amount: route.amount,
                timestamp: Date.now(),
                status: 'success',
                txId: signature
            });
            
            // Show success notification
            showNotification(`Successfully executed trade for ${token}`, 'success');
        }
    } catch (error) {
        console.error('Trade execution failed:', error);
        updateTradeUI({
            token,
            timestamp: Date.now(),
            status: 'failed',
            error: error.message
        });
        
        // Show error notification
        showNotification(`Trade failed: ${error.message}`, 'error');
    }
}

// Jupiter Integration
async function getJupiterRoute(token) {
    try {
        const response = await fetch(`${JUPITER_API_ENDPOINT}/quote`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputMint: 'SOL',
                outputMint: token,
                amount: maxTradeSize * 1e9, // Convert to lamports
                slippageBps: 50,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting Jupiter route:', error);
        return null;
    }
}

// UI Updates
function updateKOLUI() {
    const kolContainer = document.querySelector('.tracked-kols');
    kolContainer.innerHTML = '';

    trackedKOLs.forEach((kol, userId) => {
        const kolElement = document.createElement('div');
        kolElement.className = 'kol-item';
        kolElement.innerHTML = `
            <span class="kol-handle">@${kol.handle}</span>
            <span class="kol-status ${kol.active ? 'active' : 'inactive'}">
                ${kol.active ? 'Tracking' : 'Paused'}
            </span>
            <button class="remove-kol" data-id="${userId}">
                <i class="fas fa-times"></i>
            </button>
        `;
        kolContainer.appendChild(kolElement);
    });
}

function updateTweetUI(tweet, sentiment) {
    const tweetList = document.querySelector('.tweet-list');
    const tweetElement = document.createElement('div');
    tweetElement.className = 'tweet-item';
    tweetElement.innerHTML = `
        <div class="tweet-header">
            <span class="tweet-author">@${tweet.author}</span>
            <span class="tweet-time">${new Date(tweet.created_at).toLocaleTimeString()}</span>
        </div>
        <div class="tweet-content">${tweet.text}</div>
        <div class="tweet-sentiment" style="color: ${sentiment >= sentimentThreshold ? 'green' : 'inherit'}">
            Sentiment: ${sentiment.toFixed(1)}%
        </div>
    `;
    tweetList.insertBefore(tweetElement, tweetList.firstChild);
}

function updateTradeUI(trade) {
    const tradeList = document.querySelector('.trade-list');
    const tradeElement = document.createElement('div');
    tradeElement.className = `trade-item ${trade.status}`;
    tradeElement.innerHTML = `
        <div class="trade-header">
            <span class="trade-token">${trade.token}</span>
            <span class="trade-time">${new Date(trade.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="trade-details">
            ${trade.status === 'success' 
                ? `Amount: ${trade.amount} SOL<br>TX: ${trade.txId.slice(0, 8)}...`
                : `Failed: ${trade.error}`
            }
        </div>
    `;
    tradeList.insertBefore(tradeElement, tradeList.firstChild);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeSolana();

    // Add KOL
    document.getElementById('addKOL').addEventListener('click', () => {
        const handle = document.getElementById('kolSearch').value.trim();
        if (handle) {
            addKOL(handle);
            document.getElementById('kolSearch').value = '';
        }
    });

    // Settings
    document.getElementById('maxTradeSize').addEventListener('change', (e) => {
        maxTradeSize = parseFloat(e.target.value);
    });

    document.getElementById('riskLevel').addEventListener('change', (e) => {
        riskLevel = e.target.value;
    });

    document.getElementById('sentimentThreshold').addEventListener('input', (e) => {
        sentimentThreshold = parseInt(e.target.value);
    });

    // Remove KOL event delegation
    document.querySelector('.tracked-kols').addEventListener('click', (e) => {
        if (e.target.closest('.remove-kol')) {
            const userId = e.target.closest('.remove-kol').dataset.id;
            removeKOL(userId);
        }
    });
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navLinks && navLinks.classList.contains('active') && 
            !event.target.closest('.nav-links') && 
            !event.target.closest('.menu-toggle')) {
            navLinks.classList.remove('active');
        }
    });
    
    // Chatbot toggle functionality
    const chatbotHeader = document.querySelector('.chatbot-header');
    const aiChatbot = document.querySelector('.ai-chatbot');
    
    if (chatbotHeader && aiChatbot) {
        // Start with chatbot collapsed on mobile
        if (window.innerWidth <= 768) {
            aiChatbot.classList.add('collapsed');
        }
        
        chatbotHeader.addEventListener('click', function() {
            aiChatbot.classList.toggle('collapsed');
        });
    }
    
    // Handle suggestion chips
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const chatInput = document.querySelector('.chat-input');
    const chatMessages = document.querySelector('.chat-messages');
    const chatSend = document.querySelector('.chat-send');
    
    if (suggestionChips.length > 0 && chatInput && chatMessages) {
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', function() {
                const query = this.textContent;
                
                // Add user message
                addMessage('user', query);
                
                // Simulate AI response based on the query
                setTimeout(() => {
                    let response = '';
                    
                    if (query.includes('KOL')) {
                        response = `<p>Here are the trending KOLs on Solana right now:</p>
                        <ul>
                            <li>@SolanaLegend - 15 mentions in the last hour</li>
                            <li>@SolanaWhale - Just tweeted about a new project</li>
                            <li>@DefiGuru - High engagement on recent posts</li>
                        </ul>
                        <p>Would you like to track any of these KOLs?</p>`;
                    } else if (query.includes('token') || query.includes('trend')) {
                        response = `<p>Top trending tokens on Solana in the last 24 hours:</p>
                        <ul>
                            <li>SOL - Up 5.2% with increasing volume</li>
                            <li>BONK - Trending with 15% increase</li>
                            <li>JTO - New listing gaining traction</li>
                        </ul>
                        <p>The overall market sentiment is bullish.</p>`;
                    } else if (query.includes('alpha')) {
                        response = `<p>Latest alpha from Solana ecosystem:</p>
                        <ul>
                            <li>New DEX launching next week</li>
                            <li>Major partnership announcement expected soon</li>
                            <li>Upcoming token airdrop for early adopters</li>
                        </ul>
                        <p>Would you like more specific details on any of these?</p>`;
                    } else {
                        response = "I'm here to help with information about Solana KOLs and token trends. What would you like to know?";
                    }
                    
                    addMessage('bot', response);
                }, 1000);
                
                // Clear input
                chatInput.value = '';
                
                // Expand chatbot if collapsed
                if (aiChatbot.classList.contains('collapsed')) {
                    aiChatbot.classList.remove('collapsed');
                }
            });
        });
        
        // Handle send button
        if (chatSend) {
            chatSend.addEventListener('click', sendMessage);
        }
        
        // Handle enter key in input
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                // Add user message
                addMessage('user', message);
                
                // Clear input
                chatInput.value = '';
                
                // Simulate AI thinking
                setTimeout(() => {
                    addMessage('bot', "I'm analyzing the Solana ecosystem for relevant information. One moment please...");
                    
                    // Simulate AI response after "thinking"
                    setTimeout(() => {
                        let response = "Based on my analysis of recent Solana activity, I've found some interesting trends. KOLs are discussing DeFi projects more frequently, and there's growing interest in NFT marketplaces. Would you like more specific information about any particular aspect?";
                        addMessage('bot', response);
                    }, 2000);
                }, 1000);
            }
        }
        
        function addMessage(type, content) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', type);
            
            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = content;
            
            messageDiv.appendChild(messageContent);
            chatMessages.appendChild(messageDiv);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
});

// Initialize robot animation
function initializeRobotAnimation() {
    const robot = document.querySelector('.robot');
    const robotEyes = document.querySelectorAll('.robot-eye');
    const robotHead = document.querySelector('.robot-head');
    const robotArms = document.querySelectorAll('.robot-arm');
    const heroSection = document.querySelector('.hero');
    
    if (!robot || !heroSection) return;
    
    // Make robot follow mouse movement
    heroSection.addEventListener('mousemove', (e) => {
        // Calculate mouse position relative to the hero section
        const rect = heroSection.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate the center of the hero section
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate the angle between mouse and center
        const angleX = (mouseX - centerX) / centerX;
        const angleY = (mouseY - centerY) / centerY;
        
        // Move robot eyes to follow mouse
        robotEyes.forEach(eye => {
            const pupil = eye.querySelector('::after') || eye;
            const maxMove = 5;
            const moveX = angleX * maxMove;
            const moveY = angleY * maxMove;
            
            eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        // Slightly rotate robot head based on mouse position
        const maxRotation = 5;
        robotHead.style.transform = `rotate(${angleX * maxRotation}deg)`;
        
        // Move robot arms slightly based on mouse position
        if (robotArms.length >= 2) {
            const leftArm = robotArms[0];
            const rightArm = robotArms[1];
            const maxArmRotation = 5;
            
            leftArm.style.transform = `rotate(${15 + angleY * maxArmRotation}deg)`;
            rightArm.style.transform = `rotate(${-15 - angleY * maxArmRotation}deg)`;
        }
    });
    
    // Add random blinking animation
    setInterval(() => {
        robotEyes.forEach(eye => {
            eye.style.height = '2px';
            eye.style.transform = 'translateY(5px)';
            
            setTimeout(() => {
                eye.style.height = '30px';
                eye.style.transform = 'translateY(0)';
            }, 150);
        });
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds
    
    // Add occasional wave animation
    setInterval(() => {
        if (Math.random() > 0.5 && robotArms.length >= 2) {
            const rightArm = robotArms[1];
            
            // Save original transform
            const originalTransform = rightArm.style.transform;
            
            // Wave animation
            rightArm.style.transform = 'rotate(-60deg)';
            
            setTimeout(() => {
                rightArm.style.transform = 'rotate(-30deg)';
            }, 300);
            
            setTimeout(() => {
                rightArm.style.transform = 'rotate(-60deg)';
            }, 600);
            
            setTimeout(() => {
                rightArm.style.transform = 'rotate(-30deg)';
            }, 900);
            
            // Return to original position
            setTimeout(() => {
                rightArm.style.transform = originalTransform || 'rotate(-15deg)';
            }, 1200);
        }
    }, 10000); // Every 10 seconds
    
    // Add screen animation
    const screenLines = document.querySelectorAll('.screen-line');
    screenLines.forEach((line, index) => {
        line.style.animationDuration = `${3 + index * 0.5}s`;
    });
    
    // Add click interaction
    robot.addEventListener('click', () => {
        // Create speech bubble
        const bubble = document.createElement('div');
        bubble.className = 'robot-speech';
        
        // Random messages
        const messages = [
            "Hello! I'm Harvest AI! ????",
            "I analyze tweets for trading signals! ????",
            "Let me help you track KOLs! ????",
            "Connect your wallet to get started! ????",
            "I can execute trades automatically! ????"
        ];
        
        // Select random message
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        bubble.textContent = randomMessage;
        
        // Add to robot
        robot.appendChild(bubble);
        
        // Remove after animation
        setTimeout(() => {
            bubble.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            bubble.classList.remove('show');
            setTimeout(() => {
                bubble.remove();
            }, 500);
        }, 3000);
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    // Set content
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Update wallet button text
function updateWalletButtonText() {
    const walletBtn = document.querySelector('.wallet-button');
    const walletText = walletBtn.querySelector('.wallet-text');
    
    if (walletConnected && walletAddress) {
        walletBtn.classList.add('connected');
        // Format address for display (first 4 and last 4 characters)
        const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
        walletText.textContent = shortAddress;
    } else {
        walletBtn.classList.remove('connected');
        walletText.textContent = 'Connect Wallet';
    }
}
