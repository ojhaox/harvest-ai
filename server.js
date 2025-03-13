require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { TwitterApi } = require('twitter-api-v2');
const WebSocket = require('ws');
const { OpenAI } = require('openai');
const NodeCache = require('node-cache');
const { Connection, PublicKey } = require('@solana/web3.js');
const { Jupiter } = require('@jup-ag/core');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));

// Initialize APIs and connections
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const solanaConnection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

// Cache setup
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default TTL

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Active connections and streams
const activeStreams = new Map();
const connectedClients = new Set();

// Sentiment analysis using OpenAI
async function analyzeSentiment(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a crypto market sentiment analyzer. Rate the sentiment of the following tweet for trading purposes on a scale of 0 to 100, where 0 is extremely bearish and 100 is extremely bullish. Respond with only the number."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            max_tokens: 5
        });

        const sentiment = parseInt(response.choices[0].message.content.trim());
        return isNaN(sentiment) ? 50 : sentiment;
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return 50; // Neutral sentiment as fallback
    }
}

// Extract token mentions from tweet
function extractTokens(text) {
    const tokenRegex = /\$([A-Za-z0-9]+)/g;
    const matches = text.match(tokenRegex);
    return matches ? matches.map(token => token.substring(1)) : [];
}

// Validate token on Solana
async function validateToken(tokenSymbol) {
    try {
        // Cache check
        const cached = cache.get(`token:${tokenSymbol}`);
        if (cached) return cached;

        // Here you would typically:
        // 1. Query token list or Jupiter API for token address
        // 2. Verify token exists on Solana
        // 3. Check liquidity requirements
        // 4. Validate market cap and other metrics

        // For demo, we'll just return true for known tokens
        const isValid = ['SOL', 'RAY', 'SRM', 'BONK'].includes(tokenSymbol.toUpperCase());
        cache.set(`token:${tokenSymbol}`, isValid);
        return isValid;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

// Execute trade on Jupiter
async function executeTrade(tokenSymbol, amount, wallet) {
    try {
        // Initialize Jupiter
        const jupiter = await Jupiter.load({
            connection: solanaConnection,
            cluster: 'mainnet-beta',
            user: wallet // The public key of the user's wallet
        });

        // Get route
        const route = await jupiter.computeRoutes({
            inputMint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
            outputMint: new PublicKey(tokenSymbol), // Target token
            amount: amount,
            slippageBps: 50, // 0.5% slippage
        });

        if (!route.routesInfos || route.routesInfos.length === 0) {
            throw new Error('No route found');
        }

        // Execute swap
        const result = await jupiter.exchange({
            routeInfo: route.routesInfos[0],
        });

        return result;
    } catch (error) {
        console.error('Trade execution error:', error);
        throw error;
    }
}

// WebSocket message handling
function handleWebSocketMessage(ws, message) {
    try {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'subscribe':
                if (data.handle) {
                    startTracking(data.handle, ws);
                }
                break;
            case 'unsubscribe':
                if (data.handle) {
                    stopTracking(data.handle, ws);
                }
                break;
            case 'trade':
                if (data.token && data.amount && data.wallet) {
                    executeTrade(data.token, data.amount, data.wallet)
                        .then(result => {
                            ws.send(JSON.stringify({
                                type: 'trade_result',
                                success: true,
                                data: result
                            }));
                        })
                        .catch(error => {
                            ws.send(JSON.stringify({
                                type: 'trade_result',
                                success: false,
                                error: error.message
                            }));
                        });
                }
                break;
        }
    } catch (error) {
        console.error('WebSocket message handling error:', error);
    }
}

// Start tracking a KOL
async function startTracking(handle, ws) {
    try {
        const user = await twitterClient.v2.userByUsername(handle);
        if (!user.data) {
            throw new Error('User not found');
        }

        const stream = activeStreams.get(user.data.id) || {
            clients: new Set(),
            rules: new Set()
        };

        stream.clients.add(ws);
        activeStreams.set(user.data.id, stream);

        // Set up tweet monitoring
        const rules = await twitterClient.v2.streamRules();
        if (!rules.data?.find(rule => rule.value === `from:${handle}`)) {
            await twitterClient.v2.updateStreamRules({
                add: [{ value: `from:${handle}` }]
            });
        }

        ws.send(JSON.stringify({
            type: 'tracking_status',
            handle,
            status: 'active'
        }));
    } catch (error) {
        console.error('Error starting tracking:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: error.message
        }));
    }
}

// Stop tracking a KOL
async function stopTracking(handle, ws) {
    try {
        const user = await twitterClient.v2.userByUsername(handle);
        if (!user.data) return;

        const stream = activeStreams.get(user.data.id);
        if (!stream) return;

        stream.clients.delete(ws);

        if (stream.clients.size === 0) {
            activeStreams.delete(user.data.id);
            const rules = await twitterClient.v2.streamRules();
            const rule = rules.data?.find(r => r.value === `from:${handle}`);
            if (rule) {
                await twitterClient.v2.updateStreamRules({
                    delete: { ids: [rule.id] }
                });
            }
        }

        ws.send(JSON.stringify({
            type: 'tracking_status',
            handle,
            status: 'inactive'
        }));
    } catch (error) {
        console.error('Error stopping tracking:', error);
    }
}

// Set up tweet stream
async function setupTweetStream() {
    const stream = await twitterClient.v2.searchStream({
        'tweet.fields': ['created_at', 'author_id', 'text']
    });

    stream.on('data', async (tweet) => {
        const stream = activeStreams.get(tweet.author_id);
        if (!stream) return;

        const sentiment = await analyzeSentiment(tweet.text);
        const tokens = extractTokens(tweet.text);

        const message = {
            type: 'tweet',
            data: {
                ...tweet,
                sentiment,
                tokens
            }
        };

        stream.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    });

    stream.on('error', error => {
        console.error('Tweet stream error:', error);
    });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    connectedClients.add(ws);

    ws.on('message', (message) => handleWebSocketMessage(ws, message));

    ws.on('close', () => {
        connectedClients.delete(ws);
        activeStreams.forEach(stream => {
            stream.clients.delete(ws);
        });
    });
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    setupTweetStream().catch(console.error);
});

// Upgrade HTTP server to WebSocket
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}); 