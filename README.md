# KOL Tweet Tracker & Auto-Trader for Solana

An AI-powered application that tracks Key Opinion Leaders (KOLs) on Twitter and automatically executes trades on Solana based on their tweets.

## 🚀 Features

- **Real-time KOL Tweet Tracking**: Monitor influential crypto personalities' tweets in real-time
- **AI-Powered Sentiment Analysis**: Analyze tweet content to determine trading signals
- **Automated Trading**: Execute trades automatically on Solana using Jupiter aggregator
- **Risk Management**: Configurable trading parameters and risk levels
- **User-friendly Dashboard**: Monitor KOLs, tweets, and trading activity in one place

## 📋 Prerequisites

- Node.js v16 or higher
- Phantom Wallet or other Solana wallet
- Twitter API credentials
- Modern web browser with JavaScript enabled

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kol-tweet-tracker.git
cd kol-tweet-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```env
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

4. Start the development server:
```bash
npm run dev
```

## 💻 Usage

1. **Connect Your Wallet**
   - Click "Connect Solana Wallet" in the top right
   - Approve the connection in your wallet

2. **Add KOLs to Track**
   - Go to the "KOL List" section
   - Enter Twitter handles to track
   - Click "Add KOL" to start monitoring

3. **Configure Trading Settings**
   - Set maximum trade size in SOL
   - Choose risk level (Conservative/Moderate/Aggressive)
   - Adjust sentiment threshold
   - Set response time for trades

4. **Monitor Activity**
   - View real-time tweets in the dashboard
   - Track trading activity
   - Monitor sentiment analysis results

## ⚙️ Configuration

### Trading Parameters
- `maxTradeSize`: Maximum amount of SOL per trade
- `riskLevel`: Trading aggressiveness
- `sentimentThreshold`: Minimum sentiment score to trigger trades
- `responseTime`: Delay between tweet detection and trade execution

### Risk Management
- Set stop-loss limits
- Configure maximum daily trading volume
- Enable/disable trading for specific tokens

## 🔒 Security

- All wallet interactions require explicit user approval
- No private keys are stored
- API keys are securely handled server-side
- Regular security audits performed

## 📈 Performance

The application uses:
- WebSocket connections for real-time updates
- Efficient caching mechanisms
- Optimized trading execution via Jupiter aggregator
- Minimal latency for tweet processing

## ⚠️ Disclaimer

This is an experimental tool. Use at your own risk. The developers are not responsible for:
- Trading losses
- API rate limiting
- Market volatility
- Technical issues

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Twitter API
- Solana Web3.js
- Jupiter Aggregator
- Phantom Wallet
- OpenAI for sentiment analysis 