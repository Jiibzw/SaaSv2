// api/webhook.js
// Webhook pour recevoir les événements Stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Fonction pour activer un salon
async function activateSalon(subscription) {
  const { customer, metadata, status, current_period_end } = subscription;

  // Ici, vous devez enregistrer dans votre base de données
  console.log('Activation salon:', {
    customerId: customer,
    salonName: metadata.salonName,
    plan: metadata.plan,
    status: status,
    expiresAt: new Date(current_period_end * 1000)
  });

  // TODO: Enregistrer dans Firebase/Supabase/etc.
  // await db.salons.create({
  //   customerId: customer,
  //   salonName: metadata.salonName,
  //   plan: metadata.plan,
  //   status: 'active',
  //   expiresAt: new Date(current_period_end * 1000)
  // });
}

// Fonction pour désactiver un salon
async function deactivateSalon(subscription) {
  const { customer } = subscription;

  console.log('Désactivation salon:', { customerId: customer });

  // TODO: Mettre à jour dans la base de données
  // await db.salons.update({ 
  //   customerId: customer 
  // }, { 
  //   status: 'inactive' 
  // });
}

// Fonction pour prolonger l'abonnement
async function renewSubscription(invoice) {
  const { customer, subscription, status } = invoice;

  if (status === 'paid') {
    console.log('Renouvellement abonnement:', { 
      customerId: customer,
      subscriptionId: subscription 
    });

    // TODO: Prolonger l'accès dans la base de données
  }
}

// Fonction pour gérer échec de paiement
async function handlePaymentFailed(invoice) {
  const { customer, customer_email } = invoice;

  console.log('Échec paiement:', { customerId: customer, email: customer_email });

  // TODO: Envoyer email d'alerte au client
  // await sendEmail({
  //   to: customer_email,
  //   subject: 'Échec du paiement TimeToBook',
  //   body: 'Votre paiement a échoué...'
  // });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'customer.subscription.created':
      await activateSalon(event.data.object);
      break;

    case 'customer.subscription.updated':
      await activateSalon(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await deactivateSalon(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await renewSubscription(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};
