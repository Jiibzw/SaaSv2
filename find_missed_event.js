require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function findEvents() {
  try {
    const events = await stripe.events.list({
      type: 'checkout.session.completed',
      limit: 5,
    });

    console.log('Recent Checkout Events:');
    events.data.forEach(event => {
      const session = event.data.object;
      console.log(`ID: ${event.id}`);
      console.log(`Created: ${new Date(event.created * 1000).toISOString()}`);
      console.log(`Metadata:`, session.metadata);
      console.log(`Customer: ${session.customer}`);
      console.log(`Subscription: ${session.subscription}`);
      console.log('---');
    });
  } catch (err) {
    console.error(err);
  }
}

require('dotenv').config();
findEvents();