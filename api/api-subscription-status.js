const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../lib/db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }

    try {
        const { rows } = await db.query('SELECT stripe_customer_id, stripe_subscription_id FROM users WHERE username = $1', [username]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = rows[0];

        if (!user.stripe_customer_id) {
            return res.json({ status: 'none' });
        }

        // Fetch Subscription
        let subscription = null;
        if (user.stripe_subscription_id) {
            subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
        }

        // Fetch Payment Methods
        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripe_customer_id,
            type: 'card',
        });

        // Fetch Invoices
        const invoices = await stripe.invoices.list({
            customer: user.stripe_customer_id,
            limit: 5,
        });

        // Determine Plan Name
        let planName = 'Inconnu';
        let price = 0;
        if (subscription) {
             // This is a simplification. Ideally you fetch the product details.
             // Or rely on metadata if you set it on subscription creation.
             planName = subscription.metadata.plan || 'Standard';
             price = subscription.items.data[0].price.unit_amount / 100;
        }

        res.json({
            status: subscription ? subscription.status : 'inactive',
            plan: {
                name: planName,
                price: price,
                interval: 'mois'
            },
            current_period_end: subscription ? new Date(subscription.current_period_end * 1000) : null,
            trial_end: subscription && subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            cancel_at_period_end: subscription ? subscription.cancel_at_period_end : false,
            payment_method: paymentMethods.data.length > 0 ? {
                brand: paymentMethods.data[0].card.brand,
                last4: paymentMethods.data[0].card.last4,
                exp_month: paymentMethods.data[0].card.exp_month,
                exp_year: paymentMethods.data[0].card.exp_year,
                id: paymentMethods.data[0].id
            } : null,
            invoices: invoices.data.map(inv => ({
                date: new Date(inv.created * 1000),
                amount: inv.amount_paid / 100,
                status: inv.status,
                pdf: inv.invoice_pdf
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
