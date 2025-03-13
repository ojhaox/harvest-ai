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
});

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

// Wallet connection initialization
function initializeWalletConnection() {
    const connectButton = document.getElementById('connectWallet');
    if (connectButton) {
        connectButton.addEventListener('click', connectWallet);
    }
}

// MetaMask Connection
const connectWallet = async () => {
    const connectButton = document.getElementById('connectWallet');
    const walletText = connectButton.querySelector('.wallet-text');

    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Update button state
            connectButton.classList.add('connected');
            walletText.textContent = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', function (accounts) {
                if (accounts.length > 0) {
                    walletText.textContent = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
                } else {
                    connectButton.classList.remove('connected');
                    walletText.textContent = 'Connect Wallet';
                }
            });

        } catch (error) {
            console.error('User denied account access');
            walletText.textContent = 'Connect Wallet';
        }
    } else {
        alert('Please install MetaMask!');
    }
};

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
                response = "Great! Let's help you deploy your token. First, I'll need some basic information:\n1. Token Name\n2. Token Symbol\n3. Initial Supply\n\nWhat's your token name? 🪙";
            } else if (lowerMessage.includes('feature') || lowerMessage.includes('can')) {
                response = "I can help you with the following token features:\n• Mintable/Burnable\n• Pausable\n• Access Control\n• Deflationary Mechanics\n\nWhich feature interests you? ✨";
            } else if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
                response = "I'll run a comprehensive security check for your token. This includes:\n• Code Audit\n• Vulnerability Scanning\n• Best Practices Review\n\nWould you like to proceed with the security check? 🛡️";
            } else {
                response = "I'm here to help with token deployment! You can ask me about:\n• Deploying new tokens\n• Token features\n• Security checks\n\nWhat would you like to know? 🤔";
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