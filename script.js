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
const chatWidget = document.querySelector('.chat-widget');
const chatHeader = document.querySelector('.chat-header');
const chatBody = document.querySelector('.chat-body');
const chatInput = document.querySelector('.chat-input');
const chatSendBtn = document.querySelector('.chat-send-btn');
const chatSuggestions = document.querySelectorAll('.chat-suggestion');

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

// Market Statistics Updates
async function updateMarketStats() {
    try {
        // Get ETH Gas Prices (using public API)
        const gasResponse = await fetch('https://api.blocknative.com/gasprices/blockprices');
        const gasData = await gasResponse.json();
        
        if (gasData.blockPrices) {
            const estimatedPrices = gasData.blockPrices[0].estimatedPrices;
            document.getElementById('gas-low').textContent = `${Math.round(estimatedPrices[2].price)} Gwei`;
            document.getElementById('gas-avg').textContent = `${Math.round(estimatedPrices[1].price)} Gwei`;
            document.getElementById('gas-high').textContent = `${Math.round(estimatedPrices[0].price)} Gwei`;
        }

        // Get ETH Price (using CoinGecko API)
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const priceData = await priceResponse.json();
        
        if (priceData.ethereum) {
            document.getElementById('eth-price').textContent = `$${priceData.ethereum.usd.toLocaleString()}`;
        }

        // Get Latest Block Number (using public Infura endpoint)
        const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
        const blockNumber = await provider.getBlockNumber();
        document.getElementById('block-number').textContent = `#${blockNumber.toLocaleString()}`;

    } catch (error) {
        console.error('Error updating market stats:', error);
    }
}

// Update market stats every 30 seconds
updateMarketStats();
setInterval(updateMarketStats, 30000);

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