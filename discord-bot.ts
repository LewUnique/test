import { REST, Routes } from 'discord.js';
import { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, StringSelectMenuInteraction, Events } from 'discord.js';
import { storage } from './storage';
import { getConfig } from './config';

let client: Client | null = null;

// Function to format Discord markdown for guide content
const formatGuideContent = (content: string): string => {
  // Discord already supports basic markdown, just return content
  return content;
};

// Initialize and start the Discord bot
export async function startDiscordBot() {
  try {
    const config = await getConfig();
    if (!config || !config.botToken) {
      throw new Error('Bot token not configured');
    }

    // Create a new client instance
    client = new Client({ 
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
      ] 
    });

    // When the client is ready, run this code
    client.once(Events.ClientReady, async (readyClient) => {
      await storage.addLog({
        message: `Bot connected successfully as ${readyClient.user.tag}`,
        level: 'success'
      });

      console.log(`Bot connected successfully as ${readyClient.user.tag}`);
    });

    // Handle select menu interactions
    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;

      try {
        const selectMenu = interaction as StringSelectMenuInteraction;
        const selectedValue = selectMenu.values[0];

        // Log the user interaction
        await storage.addLog({
          message: `User interaction: ${interaction.user.username} selected '${selectedValue}'`,
          level: 'info'
        });

        // Get the guide content based on selected topic
        const guide = await storage.getGuideByTopicKey(selectedValue);
        
        if (!guide) {
          await selectMenu.reply({ 
            content: 'Sorry, I could not find that guide. Please try another option.',
            ephemeral: true 
          });
          return;
        }

        // Reply with the guide content
        await selectMenu.reply({ 
          content: formatGuideContent(guide.content),
          ephemeral: true  // Only visible to the user who made the selection
        });

      } catch (error) {
        console.error('Error handling interaction:', error);
        
        // Log the error
        await storage.addLog({
          message: `Error handling interaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
          level: 'error'
        });

        // Handle failed interactions gracefully
        if (interaction.isRepliable() && !interaction.replied) {
          await interaction.reply({ 
            content: 'Sorry, something went wrong processing your request. Please try again later.',
            ephemeral: true 
          });
        }
      }
    });

    // Login to Discord
    await client.login(config.botToken);
    
    return client;
  } catch (error) {
    console.error('Failed to start Discord bot:', error);
    
    // Log the error
    await storage.addLog({
      message: `Failed to start Discord bot: ${error instanceof Error ? error.message : 'Unknown error'}`,
      level: 'error'
    });
    
    throw error;
  }
}

// Update the guide menu (if it exists)
export async function updateGuideMenu() {
  try {
    if (!client) {
      throw new Error('Bot not initialized');
    }

    const config = await getConfig();
    if (!config || !config.targetChannelId || !config.messageId) {
      throw new Error('Bot configuration incomplete or no existing menu found');
    }

    const channel = await client.channels.fetch(config.targetChannelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error('Channel not found or not a text channel');
    }

    try {
      const message = await channel.messages.fetch(config.messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const selectMenu = await createGuideSelectMenu();
      await message.edit({
        content: 'Need help with something? Select a topic below:',
        components: [selectMenu]
      });

      // Update the last deployed timestamp
      await storage.updateBotConfig(config.id, {
        lastDeployed: new Date()
      });

      return { updated: true };
    } catch (error) {
      console.error('Failed to update message, deploying new menu instead:', error);
      // If message not found, deploy a new menu
      await deployNewGuideMenu();
      return { updated: true };
    }
  } catch (error) {
    console.error('Failed to update guide menu:', error);
    throw error;
  }
}

// Deploy a new guide menu
export async function deployNewGuideMenu() {
  try {
    if (!client) {
      throw new Error('Bot not initialized');
    }

    const config = await getConfig();
    if (!config || !config.targetChannelId) {
      throw new Error('Target channel not configured');
    }

    const channel = await client.channels.fetch(config.targetChannelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error('Channel not found or not a text channel');
    }

    const selectMenu = await createGuideSelectMenu();
    const message = await channel.send({
      content: 'Need help with something?\nSelect a topic below:',
      components: [selectMenu]
    });

    // Save the message ID for future updates
    await storage.updateBotConfig(config.id, {
      messageId: message.id,
      lastDeployed: new Date()
    });

    return {
      messageId: message.id,
      channelId: config.targetChannelId
    };
  } catch (error) {
    console.error('Failed to deploy guide menu:', error);
    throw error;
  }
}

// Create a select menu with guide options
async function createGuideSelectMenu() {
  const guides = await storage.getGuides();
  
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('guide-select')
    .setPlaceholder('Select guide topic...');

  guides.forEach(guide => {
    selectMenu.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(guide.label)
        .setValue(guide.topicKey)
    );
  });

  return new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMenu);
}

// Reconnect the bot (logout and login again)
export async function reconnectBot() {
  try {
    // Destroy the existing client if it exists
    if (client) {
      await client.destroy();
      client = null;
    }
    
    // Start the bot again
    await startDiscordBot();
    
    return { success: true };
  } catch (error) {
    console.error('Failed to reconnect bot:', error);
    throw error;
  }
}
