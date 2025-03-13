// KOL Activity Manager for real-time updates
class KOLActivityManager {
    constructor() {
        this.trackedKolsContainer = document.querySelector('.tracked-kols');
        this.tweetList = document.querySelector('.tweet-list');
        this.updateInterval = 30000; // Update every 30 seconds
        this.initializeTracking();
    }

    // Initialize real-time tracking
    initializeTracking() {
        // Initial update
        this.updateKOLActivity();
        this.updateRecentTweets();

        // Set up periodic updates
        setInterval(() => {
            this.updateKOLActivity();
            this.updateRecentTweets();
        }, this.updateInterval);
    }

    // Update KOL activity display
    async updateKOLActivity() {
        if (!window.walletAddress) return;

        const kols = kolManager.getKOLsForWallet(window.walletAddress);
        if (!kols || kols.length === 0) {
            this.trackedKolsContainer.innerHTML = '<p>No KOLs being tracked</p>';
            return;
        }

        // Clear existing entries
        this.trackedKolsContainer.innerHTML = '';

        // Add active KOLs
        kols.filter(kol => kol.status === 'active').forEach(kol => {
            const kolEntry = this.createKOLEntry(kol);
            this.trackedKolsContainer.appendChild(kolEntry);
        });
    }

    // Create KOL entry element
    createKOLEntry(kol) {
        const entry = document.createElement('div');
        entry.className = 'kol-entry';
        entry.innerHTML = `
            <div class="kol-avatar">${kol.name.charAt(0).toUpperCase()}</div>
            <div class="kol-info">
                <div class="kol-name">${kol.name}</div>
                <div class="kol-handle">${kol.handle}</div>
            </div>
            <div class="kol-status">
                <span class="status-indicator"></span>
                Active
            </div>
        `;
        return entry;
    }

    // Update recent tweets
    async updateRecentTweets() {
        if (!window.walletAddress) return;

        const kols = kolManager.getKOLsForWallet(window.walletAddress);
        if (!kols || kols.length === 0) {
            this.tweetList.innerHTML = '<p>No recent tweets</p>';
            return;
        }

        // In a real implementation, you would fetch tweets from Twitter API
        // For now, we'll simulate with placeholder tweets
        const tweets = this.getPlaceholderTweets(kols);
        
        // Clear existing tweets
        this.tweetList.innerHTML = '';

        // Add new tweets
        tweets.forEach(tweet => {
            const tweetElement = this.createTweetElement(tweet);
            this.tweetList.appendChild(tweetElement);
        });
    }

    // Create tweet element
    createTweetElement(tweet) {
        const tweetDiv = document.createElement('div');
        tweetDiv.className = 'tweet';
        tweetDiv.innerHTML = `
            <div class="tweet-header">
                <div class="tweet-avatar">${tweet.author.charAt(0)}</div>
                <div class="tweet-name">${tweet.author}</div>
                <div class="tweet-handle">${tweet.handle}</div>
                <div class="tweet-time">${tweet.time}</div>
            </div>
            <div class="tweet-content">
                ${tweet.content}
            </div>
            <div class="tweet-actions">
                <div class="tweet-action"><i class="far fa-heart"></i> ${tweet.likes}</div>
                <div class="tweet-action"><i class="far fa-retweet"></i> ${tweet.retweets}</div>
                <div class="tweet-action"><i class="far fa-comment"></i> ${tweet.comments}</div>
            </div>
        `;
        return tweetDiv;
    }

    // Placeholder tweets (replace with actual Twitter API integration)
    getPlaceholderTweets(kols) {
        const now = new Date();
        const tweets = [];
        
        // Generate recent-looking timestamps
        const getRandomTime = () => {
            const minutes = Math.floor(Math.random() * 59);
            return minutes === 0 ? 'Just now' : `${minutes}m ago`;
        };

        // Generate random engagement numbers
        const getRandomEngagement = () => ({
            likes: Math.floor(Math.random() * 1000),
            retweets: Math.floor(Math.random() * 300),
            comments: Math.floor(Math.random() * 100)
        });

        // Sample tweet contents for different topics
        const tweetTemplates = [
            "Just analyzed the latest #Solana network metrics. Impressive growth in TPS and validator count! 🚀 #Crypto",
            "New partnership announcement coming soon! The ecosystem is expanding. Stay tuned! 💫 #Web3",
            "Incredible to see the community building on #Solana. Check out these amazing projects: [LINK] 🛠️",
            "Market analysis: $SOL showing strong fundamentals. Network activity at all-time high! 📈 #DeFi",
            "Join us for a Twitter Space tomorrow to discuss the future of Solana! 🎙️ #SolanaSpaces"
        ];

        // Create tweets for active KOLs
        kols.filter(kol => kol.status === 'active').forEach(kol => {
            const engagement = getRandomEngagement();
            tweets.push({
                author: kol.name,
                handle: kol.handle,
                time: getRandomTime(),
                content: tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)],
                likes: engagement.likes,
                retweets: engagement.retweets,
                comments: engagement.comments
            });
        });

        // Sort by time (random for now, but would be actual timestamps in production)
        return tweets.sort(() => Math.random() - 0.5).slice(0, 3);
    }
}

// Initialize KOL activity manager
const kolActivityManager = new KOLActivityManager();

// Update activity when wallet connection changes
document.addEventListener('walletConnected', () => {
    kolActivityManager.updateKOLActivity();
    kolActivityManager.updateRecentTweets();
});

document.addEventListener('walletDisconnected', () => {
    kolActivityManager.updateKOLActivity();
    kolActivityManager.updateRecentTweets();
}); 