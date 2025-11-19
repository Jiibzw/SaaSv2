// api/webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  console.log('Webhook reçu:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('Activation salon:', event.data.object);
        break;

      case 'customer.subscription.deleted':
        console.log('Désactivation salon:', event.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('Paiement réussi:', event.data.object);
        break;

      case 'invoice.payment_failed':
        console.log('Paiement échoué:', event.data.object);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
};