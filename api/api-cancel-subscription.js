// api/cancel-subscription.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { username } = req.body;
    console.log('Cancel request for:', username);

    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }

    const { rows } = await db.query('SELECT stripe_subscription_id FROM users WHERE username = $1', [username]);
    console.log('DB Rows:', rows);
    
    if (rows.length === 0 || !rows[0].stripe_subscription_id) {
        console.log('Subscription not found for user:', username);
        return res.status(404).json({ error: 'Subscription not found' });
    }

    const subscriptionId = rows[0].stripe_subscription_id;
    console.log('Cancelling subscriptionId:', subscriptionId);

    if (typeof subscriptionId !== 'string') {
        console.error('Invalid subscription ID type:', typeof subscriptionId);
        return res.status(500).json({ error: 'Invalid subscription ID in database' });
    }

    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      { cancel_at_period_end: true }
    );

    res.status(200).json({ 
      success: true,
      endsAt: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};