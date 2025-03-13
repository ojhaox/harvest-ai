// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar background change on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
        navbar.style.boxShadow = 'none';
    }
});

// Reveal elements on scroll
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
document.querySelectorAll('.about-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

// Add hover effect to CTA button
const ctaButton = document.querySelector('.cta-button');
ctaButton.addEventListener('mouseover', () => {
    ctaButton.style.transform = 'translateY(-3px)';
    ctaButton.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
});

ctaButton.addEventListener('mouseout', () => {
    ctaButton.style.transform = 'translateY(0)';
    ctaButton.style.boxShadow = 'none';
});

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

// Add click event to wallet button
document.getElementById('connectWallet').addEventListener('click', connectWallet);

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

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeChat);

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

        // Get ETH Price (using CoinGecko API with CORS mode)
        console.log('Fetching ETH price...');
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        const priceData = await priceResponse.json();
        console.log('ETH price data:', priceData);
        
        if (priceData.ethereum) {
            document.getElementById('eth-price').textContent = `$${priceData.ethereum.usd.toLocaleString()}`;
        } else {
            document.getElementById('eth-price').textContent = 'Loading...';
        }

        // Ensure ethers.js is loaded
        await waitForEthers();

        // Get Gas Prices and Block Number using Web3
        console.log('Initializing Web3...');
        // Try multiple providers in case one fails
        let provider;
        const providers = [
            'https://eth-mainnet.public.blastapi.io',
            'https://rpc.ankr.com/eth',
            'https://ethereum.publicnode.com',
            'https://cloudflare-eth.com'
        ];

        let error;
        for (const rpcUrl of providers) {
            try {
                provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                // Test the connection
                await provider.getNetwork();
                console.log('Connected to provider:', rpcUrl);
                break;
            } catch (e) {
                console.log('Failed to connect to provider:', rpcUrl);
                error = e;
                continue;
            }
        }

        if (!provider) {
            throw error || new Error('No working provider found');
        }
        
        // Get Gas Price
        console.log('Fetching gas prices...');
        const gasPrice = await provider.getGasPrice();
        const gasPriceInGwei = Math.round(Number(ethers.utils.formatUnits(gasPrice, "gwei")));
        console.log('Gas price:', gasPriceInGwei, 'Gwei');

        // Calculate different gas price tiers
        const lowGasPrice = Math.max(1, Math.round(gasPriceInGwei * 0.8));  // Minimum 1 Gwei
        const avgGasPrice = gasPriceInGwei;
        const highGasPrice = Math.round(gasPriceInGwei * 1.2);

        document.getElementById('gas-low').textContent = `${lowGasPrice} Gwei`;
        document.getElementById('gas-avg').textContent = `${avgGasPrice} Gwei`;
        document.getElementById('gas-high').textContent = `${highGasPrice} Gwei`;

        // Get Block Number
        console.log('Fetching block number...');
        const blockNumber = await provider.getBlockNumber();
        console.log('Block number:', blockNumber);
        
        if (blockNumber) {
            document.getElementById('block-number').textContent = `#${blockNumber.toLocaleString()}`;
        } else {
            document.getElementById('block-number').textContent = 'Loading...';
        }

    } catch (error) {
        console.error('Error updating market stats:', error);
        // Set fallback UI for errors
        document.getElementById('eth-price').textContent = 'Loading...';
        document.getElementById('gas-low').textContent = 'Loading...';
        document.getElementById('gas-avg').textContent = 'Loading...';
        document.getElementById('gas-high').textContent = 'Loading...';
        document.getElementById('block-number').textContent = 'Loading...';
        
        // Try to update again after 5 seconds if there's an error
        setTimeout(updateMarketStats, 5000);
    }
}

// Start updates when the page is loaded
window.addEventListener('load', async () => {
    console.log('Starting market statistics updates...');
    await waitForEthers();
    updateMarketStats();
    // Update market stats every 30 seconds
    setInterval(updateMarketStats, 30000);
});

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