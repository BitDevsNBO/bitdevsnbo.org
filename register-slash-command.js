const axios = require('axios');

async function registerSlashCommand() {
  console.log('🤖 Registering /claim-sats slash command with Discord...\n');

  // Get environment variables
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const applicationId = process.env.DISCORD_APPLICATION_ID;
  const guildId = process.env.DISCORD_GUILD_ID; // Optional: for guild-specific commands

  if (!botToken || !applicationId) {
    console.error('❌ Missing required environment variables:');
    console.error('   DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID are required');
    console.error('\nSet them like this:');
    console.error('   export DISCORD_BOT_TOKEN="your_bot_token"');
    console.error('   export DISCORD_APPLICATION_ID="your_app_id"');
    process.exit(1);
  }

  // Define the slash command
  const command = {
    name: 'claim-sats',
    description: 'Claim your 10 sats welcome reward for joining BitDevsNBO!',
    type: 1 // CHAT_INPUT
  };

  try {
    // Determine URL (guild-specific or global)
    let url;
    if (guildId) {
      url = `https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`;
      console.log('📍 Registering guild-specific command (instant activation)');
    } else {
      url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
      console.log('🌍 Registering global command (may take up to 1 hour)');
    }

    // Register the command
    const response = await axios.post(url, command, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Successfully registered slash command!');
    console.log(`   Command ID: ${response.data.id}`);
    console.log(`   Command Name: /${response.data.name}`);
    console.log(`   Description: ${response.data.description}`);
    
    if (guildId) {
      console.log('\n🚀 Command is ready to use immediately in your server!');
    } else {
      console.log('\n⏳ Global command may take up to 1 hour to appear in all servers.');
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Deploy your Netlify functions');
    console.log('2. Set the Interactions Endpoint URL in Discord Developer Portal');
    console.log('3. Test the command in your Discord server!');

  } catch (error) {
    console.error('❌ Failed to register slash command:');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('\n💡 This usually means your bot token is invalid.');
      console.error('   Double-check your DISCORD_BOT_TOKEN environment variable.');
    }
  }
}

// Show usage if no environment variables are set
if (!process.env.DISCORD_BOT_TOKEN && !process.env.DISCORD_APPLICATION_ID) {
  console.log('🤖 Discord Slash Command Registration\n');
  console.log('Usage:');
  console.log('  export DISCORD_BOT_TOKEN="your_bot_token"');
  console.log('  export DISCORD_APPLICATION_ID="your_application_id"');
  console.log('  export DISCORD_GUILD_ID="your_guild_id"  # Optional: for instant activation');
  console.log('  node register-slash-command.js\n');
  console.log('Get these values from: https://discord.com/developers/applications');
} else {
  registerSlashCommand();
} 