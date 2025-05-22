import { storage } from './storage';
import type { BotConfig } from '@shared/schema';

export async function getConfig(): Promise<BotConfig | undefined> {
  // Try to get the config from storage
  let config = await storage.getBotConfig();
  
  // If no config exists, use environment variables
  if (!config) {
    // Use environment variables as fallbacks
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const targetChannelId = process.env.DISCORD_CHANNEL_ID;
    
    if (botToken && targetChannelId) {
      config = await storage.saveBotConfig({
        botToken,
        targetChannelId,
        messageId: undefined,
        lastDeployed: undefined
      });
    }
  }
  
  return config;
}
