const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
    origin: "*",
    credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Reddit API proxy endpoint
app.get('/api/reddit/*', async (req, res) => {
    try {
        // Extract the path after /api/reddit/
        const redditPath = req.params[0];
        
        // Construct the Reddit API URL
        const redditUrl = `https://www.reddit.com/${redditPath}.json`;
        
        // Add query parameters
        const queryParams = new URLSearchParams(req.query);
        const fullUrl = queryParams.toString() ? `${redditUrl}?${queryParams.toString()}` : redditUrl;
        
        console.log(`Proxying request to: ${fullUrl}`);
        
        // Make request to Reddit API
        const response = await fetch(fullUrl, {
            headers: {
                'User-Agent': 'RedInsight/1.0 (Educational Project)',
                'Accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });
        
        if (!response.ok) {
            console.error(`Reddit API error: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({
                error: `Reddit API error: ${response.status}`,
                message: response.statusText
            });
        }
        
        const data = await response.json();
        
        // Add CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        
        res.json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'RedInsight API is running' });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 RedInsight server running on http://localhost:${PORT}`);
    console.log(`📡 Reddit API proxy available at http://localhost:${PORT}/api/reddit/*`);
    console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
}); 