const db = require('./lib/db');

async function update() {
  try {
    const username = 'salon_elegance';
    const customerId = 'cus_TSqSr3VTrfR9PD';
    const subscriptionId = 'sub_1SVulYPm2MfZOu5ytbuzAFL9';

    await db.query(
        'UPDATE users SET stripe_customer_id = $1, stripe_subscription_id = $2 WHERE username = $3',
        [customerId, subscriptionId, username]
    );
    console.log(`Updated ${username} with ${customerId} and ${subscriptionId}`);
  } catch (err) {
    console.error(err);
  }
}

update();