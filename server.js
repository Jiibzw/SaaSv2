const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Helper to wrap Vercel-style async functions
const wrapVercelFunction = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
};

// Webhook needs raw body for Stripe signature verification
app.use('/api/webhook', bodyParser.raw({ type: 'application/json' }));

// Other routes use JSON parsing
app.use((req, res, next) => {
    if (req.path === '/api/webhook') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// API Routes
// Note: We map the routes to match the Vercel file structure or expected endpoints
app.all('/api/api-create-checkout-session', wrapVercelFunction(require('./api/api-create-checkout-session')));
app.all('/api/webhook', wrapVercelFunction(require('./api/api-webhook')));
app.all('/api/attach-payment-method', wrapVercelFunction(require('./api/api-attach-payment-method')));
app.all('/api/cancel-subscription', wrapVercelFunction(require('./api/api-cancel-subscription')));

// Standardized Vercel routes (filename = route)
app.all('/api/api-coiffeurs', wrapVercelFunction(require('./api/api-coiffeurs')));
app.all('/api/api-bookings', wrapVercelFunction(require('./api/api-bookings')));
app.all('/api/api-auth', wrapVercelFunction(require('./api/api-auth')));
app.all('/api/api-subscription-status', wrapVercelFunction(require('./api/api-subscription-status')));

// Handle success page
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
