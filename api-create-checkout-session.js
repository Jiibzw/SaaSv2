// api/create-checkout-session.js
// Vercel Serverless Function pour créer une session de paiement Stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { plan, email, salonName } = req.body;

    // Définir les prix selon le plan
    const prices = {
      starter: process.env.STRIPE_PRICE_STARTER, // ID du prix dans Stripe
      pro: process.env.STRIPE_PRICE_PRO
    };

    if (!prices[plan]) {
      res.status(400).json({ error: 'Plan invalide' });
      return;
    }

    // Créer la session de paiement
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
        plan: plan
      },
      subscription_data: {
        trial_period_days: 14, // 14 jours d'essai gratuit
        metadata: {
          salonName: salonName,
          plan: plan
        }
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
};
