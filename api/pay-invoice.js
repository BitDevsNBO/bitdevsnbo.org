const axios = require('axios');

// In-memory storage for claimed users (use database in production)
const claimedUsers = new Set();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { invoice, userId, username } = req.body;

    if (!invoice || !userId) {
      return res.status(400).json({ error: 'Invoice and userId required' });
    }

    // Validate invoice format
    if (!invoice.startsWith('lnbc')) {
      return res.status(400).json({ error: 'Invalid Lightning invoice format' });
    }

    // Check if user already claimed
    if (claimedUsers.has(userId)) {
      return res.status(400).json({ error: 'User has already claimed reward' });
    }

    // Get admin key from environment
    const adminKey = process.env.LNBITS_ADMIN_KEY;
    if (!adminKey) {
      console.error('LNBITS_ADMIN_KEY not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Pay the invoice
    const response = await axios.post(
      'https://demo.lnbits.com/api/v1/payments',
      {
        out: true,
        bolt11: invoice
      },
      {
        headers: {
          'X-Api-Key': adminKey,
          'Content-Type': 'application/json'
        }
      }
    );

    // Mark user as claimed
    claimedUsers.add(userId);
    console.log(`✅ Paid invoice for user ${username} (${userId}) at ${new Date().toISOString()}`);

    return res.status(200).json({
      success: true,
      message: `Payment sent! Welcome to BitDevsNBO, ${username}! ⚡`,
      paymentHash: response.data.payment_hash
    });

  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to process payment';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }

    return res.status(500).json({ 
      error: errorMessage,
      details: error.response?.data || error.message
    });
  }
}; 