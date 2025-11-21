// api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    const { plan, email, salonName, username } = req.body;

    if (!plan || !email || !salonName || !username) {
      res.status(400).json({ 
        error: 'Paramètres manquants',
        required: ['plan', 'email', 'salonName', 'username']
      });
      return;
    }

    const prices = {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      premium: process.env.STRIPE_PRICE_PREMIUM // Added premium
    };

    if (!prices[plan]) {
      res.status(400).json({ error: 'Plan invalide' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: prices[plan],
        quantity: 1,
      }],
      success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/pricing`,
      customer_email: email,
      metadata: {
        salonName: salonName,
        plan: plan,
        username: username // Pass username to link later
      },
      subscription_data: {
        metadata: {
          salonName: salonName,
          plan: plan,
          username: username
        }
      }
    });

    res.status(200).json({ 
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};