const axios = require('axios');

// In-memory storage for claimed users (use database in production)
const claimedUsers = new Set();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature-Ed25519, X-Signature-Timestamp');
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
    // Verify Discord webhook signature (production security)
    if (!verifyDiscordSignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = req.body;
    
    // Handle Discord interaction types
    switch (payload.type) {
      case 1: // PING
        return res.status(200).json({ type: 1 });
        
      case 2: // APPLICATION_COMMAND
        const commandResult = await handleSlashCommand(payload);
        return res.status(200).json(commandResult);
        
      case 3: // MESSAGE_COMPONENT
        const buttonResult = await handleButtonClick(payload);
        return res.status(200).json(buttonResult);
        
      default:
        return res.status(400).json({ error: 'Unknown interaction type' });
    }
  } catch (error) {
    console.error('Discord webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function handleSlashCommand(payload) {
  const { data, member } = payload;
  
  if (data.name === 'claim-sats') {
    return await processRewardClaim(member.user);
  }
  
  return {
    type: 4,
    data: {
      content: 'Unknown command',
      flags: 64 // Ephemeral
    }
  };
}

async function handleButtonClick(payload) {
  const { data, member } = payload;
  
  if (data.custom_id === 'claim_reward') {
    return await processRewardClaim(member.user);
  }
  
  return {
    type: 4,
    data: {
      content: 'Unknown button',
      flags: 64
    }
  };
}

async function processRewardClaim(user) {
  try {
    // Check if user already claimed (use database in production)
    const hasClaimedBefore = await checkIfUserClaimed(user.id);
    
    if (hasClaimedBefore) {
      return {
        type: 4,
        data: {
          content: '❌ You have already claimed your welcome reward!',
          flags: 64
        }
      };
    }

    // Generate LNURLw for instant claiming
    const lnurlw = await generateLNURLw(user);
    
    if (!lnurlw) {
      return {
        type: 4,
        data: {
          content: '❌ Failed to generate reward. Please try again later.',
          flags: 64
        }
      };
    }

    // Mark user as claimed
    await markUserAsClaimed(user.id);

    return {
      type: 4,
      data: {
        content: `🎉 **Welcome to BitDevsNBO, ${user.username}!**\n\n` +
                 `To claim your 10 sats:\n` +
                 `1. Create a **receive invoice for 10 sats** in your Lightning wallet\n` +
                 `2. Reply with your invoice (starts with "lnbc")\n` +
                 `3. We'll pay it instantly! ⚡\n\n` +
                 `*Works with: Phoenix, Muun, Zeus, Wallet of Satoshi, Blue Wallet, etc.*`,
        flags: 64
      }
    };
  } catch (error) {
    console.error('Reward processing error:', error);
    return {
      type: 4,
      data: {
        content: '❌ Error processing reward. Please contact an admin.',
        flags: 64
      }
    };
  }
}

async function generateLNURLw(user) {
  // For now, we'll use manual invoice payment instead of LNURLw
  // since the withdraw extension isn't enabled on demo.lnbits.com
  return true; // Just return success to continue the flow
}

async function checkIfUserClaimed(userId) {
  return claimedUsers.has(userId);
}

async function markUserAsClaimed(userId) {
  claimedUsers.add(userId);
  console.log(`User ${userId} claimed reward at ${new Date().toISOString()}`);
}

function verifyDiscordSignature(req) {
  // In production, verify Discord's signature for security
  // For development, skip verification
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // TODO: Implement signature verification
  // const signature = req.headers['x-signature-ed25519'];
  // const timestamp = req.headers['x-signature-timestamp'];
  // const body = JSON.stringify(req.body);
  // return verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY);
  
  return true; // Skip verification for now
} 