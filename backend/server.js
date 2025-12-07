
const express = require('express');
const admin = require('firebase-admin');
const { Client, Webhook: CoinbaseWebhook } = require('coinbase-commerce-node');
const cors = require('cors');
const Stripe = require('stripe');

// Initialize Firebase Admin
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in Cloud Run environment
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

// Environment Variables
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;
const COINBASE_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const CASHAPP_WEBHOOK_SECRET = process.env.CASHAPP_WEBHOOK_SECRET;

// Initialize Payment Clients
Client.init(COINBASE_API_KEY || '');
const { Charge } = require('coinbase-commerce-node').resources;
const stripe = Stripe(STRIPE_SECRET_KEY || '');

// --- HELPERS ---
const updateBalance = async (userId, amount, method, transactionId, extraData = {}) => {
    if (!userId || !amount) return;
    
    const userRef = db.collection('users').doc(userId);
    const txRef = userRef.collection('transactions').doc(transactionId);

    await db.runTransaction(async (t) => {
        const txDoc = await t.get(txRef);
        if (txDoc.exists) {
            console.log('Transaction already processed:', transactionId);
            return;
        }

        const userDoc = await t.get(userRef);
        if (!userDoc.exists) {
            console.error("User not found: ", userId);
            return;
        }
        
        const currentBalance = userDoc.data().balance || 0;
        const newBalance = currentBalance + amount;

        // Update Balance
        t.update(userRef, { balance: newBalance });
        
        // Record Transaction
        t.set(txRef, {
            amount: amount,
            currency: 'USD',
            status: 'completed',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            method: method,
            processorTransactionId: transactionId,
            type: 'deposit',
            ...extraData
        });
    });
    console.log(`Successfully credited $${amount} to user ${userId} via ${method}`);
};

// --- COINBASE ROUTES ---

app.post('/create-payment', express.json(), async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: 'Missing amount or userId' });
    }

    const chargeData = {
      name: 'Emperial Slots Credits',
      description: 'Account Deposit',
      local_price: {
        amount: amount,
        currency: 'USD',
      },
      pricing_type: 'fixed_price',
      metadata: {
        userId: userId,
      },
    };

    const charge = await Charge.create(chargeData);
    
    return res.status(200).json({ 
      checkoutUrl: charge.hosted_url, 
      chargeId: charge.id 
    });

  } catch (error) {
    console.error('Error creating coinbase charge:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/coinbase/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const rawBody = req.body.toString();
  const signature = req.headers['x-cc-webhook-signature'];

  try {
    const event = CoinbaseWebhook.verifySignature(rawBody, signature, COINBASE_WEBHOOK_SECRET);

    if (event.type === 'charge:confirmed') {
      const charge = event.data;
      const userId = charge.metadata.userId;
      const amount = parseFloat(charge.pricing.local.amount);
      const transactionId = charge.id;

      await updateBalance(userId, amount, 'coinbase', transactionId, {
          cryptoSymbol: charge.pricing.local.currency || 'USD'
      });
    }

    res.status(200).send('Webhook Received');

  } catch (error) {
    console.error('Coinbase Webhook Verification Failed:', error.message);
    res.status(400).send('Webhook Error');
  }
});

// --- STRIPE ROUTES ---

app.post('/create-stripe-payment', express.json(), async (req, res) => {
    try {
        const { amount, userId } = req.body;
        
        if (!amount || !userId) {
            return res.status(400).json({ error: 'Missing amount or userId' });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: "usd",
            metadata: {
                userId: userId
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (e) {
        console.error('Stripe Error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Stripe Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;
        const amount = paymentIntent.amount / 100; // Convert cents back to USD
        const transactionId = paymentIntent.id;

        await updateBalance(userId, amount, 'stripe', transactionId, {
            paymentMethod: paymentIntent.payment_method_types?.[0] || 'card'
        });
    }

    res.status(200).send({received: true});
});

// --- CASH APP / GENERIC WEBHOOK ---
// Requires integration with Square or similar provider. 
// This endpoint receives confirmations.

app.post('/cashapp/webhook', express.json(), async (req, res) => {
    // Verify signature logic would go here depending on the provider (e.g. Square)
    // For now, we assume a secure internal call or signed payload
    const { type, data } = req.body;
    
    // Check if secure secret matches (simple authentication for custom webhooks)
    const inboundSecret = req.headers['x-webhook-secret'];
    if (inboundSecret !== CASHAPP_WEBHOOK_SECRET) {
        return res.status(403).send('Forbidden');
    }

    if (type === 'payment.updated' && data.status === 'COMPLETED') {
        const { userId, amount, transactionId } = data;
        
        await updateBalance(userId, parseFloat(amount), 'cashapp', transactionId, {});
        return res.status(200).send('Success');
    }

    res.status(200).send('Ignored');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
