// api/cancel-subscription.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      { cancel_at_period_end: true }
    );

    res.status(200).json({ 
      success: true,
      endsAt: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};