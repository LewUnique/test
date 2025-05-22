import { 
  users, type User, type InsertUser, 
  guides, type Guide, type InsertGuide,
  botConfig, type BotConfig, type InsertBotConfig,
  botLogs, type BotLog, type InsertBotLog
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Guide methods
  getGuide(id: number): Promise<Guide | undefined>;
  getGuideByTopicKey(topicKey: string): Promise<Guide | undefined>;
  getGuides(): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: number, guide: Partial<InsertGuide>): Promise<Guide | undefined>;
  deleteGuide(id: number): Promise<boolean>;

  // Bot config methods
  getBotConfig(): Promise<BotConfig | undefined>;
  saveBotConfig(config: InsertBotConfig): Promise<BotConfig>;
  updateBotConfig(id: number, config: Partial<InsertBotConfig>): Promise<BotConfig | undefined>;

  // Bot logs methods
  getLogs(): Promise<BotLog[]>;
  addLog(log: InsertBotLog): Promise<BotLog>;
  clearLogs(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private guides: Map<number, Guide>;
  private botConfigs: Map<number, BotConfig>;
  private logs: Map<number, BotLog>;
  private userId: number;
  private guideId: number;
  private botConfigId: number;
  private logId: number;

  constructor() {
    this.users = new Map();
    this.guides = new Map();
    this.botConfigs = new Map();
    this.logs = new Map();
    this.userId = 1;
    this.guideId = 1;
    this.botConfigId = 1;
    this.logId = 1;

    // Initialize with default guides
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add default guides
    const welcomeGuide: InsertGuide = {
      label: "📢│WELCOME – No Man's Rust",
      content: `# 📢│WELCOME – No Man's Rust

Welcome to No Man's Rust! This guide will help you understand our server features.

## Server Features
- 🏪 **Shop System** - Buy and sell items using in-game currency
- 🛡️ **Fort Protection** - Protect your base while offline
- 🏦 **Bank System** - Safely store your items and resources
- 🌐 **Account Linking** - Connect your Discord and Rust accounts

Use the dropdown menu below to explore specific guides for each feature.`,
      topicKey: "welcome-nmr"
    };

    const shopGuide: InsertGuide = {
      label: "🏪│NMR-SHOP – Using the Discord Shop",
      content: `# 🏪│NMR-SHOP – Using the Discord Shop

Our Discord shop lets you purchase in-game items and resources without being online in Rust.

## Shop Commands
- \`/shop\` - Browse available items
- \`/shop buy [item] [amount]\` - Purchase items
- \`/shop sell [item] [amount]\` - Sell your items

## Shop Categories
- 🧱 **Building Materials**
- 🔫 **Weapons & Ammo**
- 🍖 **Food & Medical**
- 🛠️ **Tools & Components**

*All purchases are delivered to your base or can be picked up at outpost.*`,
      topicKey: "shop-nmr"
    };

    const fortGuide: InsertGuide = {
      label: "🛡│NMR-FORT – Offline Raid Protection",
      content: `# 🛡│NMR-FORT – Offline Raid Protection

Fort protection keeps your base safe when you're offline.

## How It Works
1. Protection activates automatically when all team members are offline
2. Your base becomes significantly harder to raid
3. Protection deactivates when any team member comes online

## Fort Commands
- \`/fort status\` - Check if your base is protected
- \`/fort team\` - View your team's protection status
- \`/fort report\` - Report issues with protection

*Note: Protection has a 15-minute activation delay after logout.*`,
      topicKey: "fort-nmr"
    };

    const bankGuide: InsertGuide = {
      label: "🏦│NMR-BANK – Manage Your Gears",
      content: `# 🏦│NMR-BANK – Manage Your Gears

The NMR bank system allows you to safely store items and resources.

## Bank Features
- Secure storage for your valuables
- Access your bank from any terminal
- Protection from raids and decay
- Interest on stored resources

## Bank Commands
- \`/bank balance\` - Check your bank balance
- \`/bank deposit [amount]\` - Deposit resources
- \`/bank withdraw [amount]\` - Withdraw resources
- \`/bank transfer [player] [amount]\` - Transfer to another player

*Bank terminals can be found at Outpost, Bandit Camp, and all safe zones.*`,
      topicKey: "bank-nmr"
    };

    const linkGuide: InsertGuide = {
      label: "🌐│NMR-LINK – Link Your Rust Account",
      content: `# 🌐│NMR-LINK – Link Your Rust Account

Linking your Discord and Rust accounts provides additional benefits and features.

## Benefits of Linking
- Access to VIP features and commands
- Automatic role assignments in Discord
- Special in-game perks and bonuses
- Enhanced protection for your base and items

## How to Link
1. In Rust, type \`/discord\` in chat
2. Copy the unique code provided
3. In Discord, use the \`/link\` command with your code
4. Once confirmed, your accounts are linked!

*If you encounter any issues, please contact a server admin.*`,
      topicKey: "link-nmr"
    };

    this.createGuide(welcomeGuide);
    this.createGuide(shopGuide);
    this.createGuide(fortGuide);
    this.createGuide(bankGuide);
    this.createGuide(linkGuide);

    // Default bot configuration
    const defaultConfig: InsertBotConfig = {
      botToken: process.env.DISCORD_BOT_TOKEN || "your-token-here",
      targetChannelId: process.env.DISCORD_CHANNEL_ID || "your-channel-id-here",
      messageId: undefined,
      lastDeployed: undefined
    };
    this.saveBotConfig(defaultConfig);

    // Initial log
    this.addLog({
      message: "Discord bot application initialized",
      level: "info"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Guide methods
  async getGuide(id: number): Promise<Guide | undefined> {
    return this.guides.get(id);
  }

  async getGuideByTopicKey(topicKey: string): Promise<Guide | undefined> {
    return Array.from(this.guides.values()).find(
      (guide) => guide.topicKey === topicKey,
    );
  }

  async getGuides(): Promise<Guide[]> {
    return Array.from(this.guides.values());
  }

  async createGuide(insertGuide: InsertGuide): Promise<Guide> {
    const id = this.guideId++;
    const guide: Guide = { ...insertGuide, id };
    this.guides.set(id, guide);
    return guide;
  }

  async updateGuide(id: number, guideUpdate: Partial<InsertGuide>): Promise<Guide | undefined> {
    const guide = this.guides.get(id);
    if (!guide) return undefined;

    const updatedGuide: Guide = { ...guide, ...guideUpdate };
    this.guides.set(id, updatedGuide);
    return updatedGuide;
  }

  async deleteGuide(id: number): Promise<boolean> {
    return this.guides.delete(id);
  }

  // Bot config methods
  async getBotConfig(): Promise<BotConfig | undefined> {
    // Return the first config as we only have one
    return Array.from(this.botConfigs.values())[0];
  }

  async saveBotConfig(insertConfig: InsertBotConfig): Promise<BotConfig> {
    const id = this.botConfigId++;
    const config: BotConfig = { ...insertConfig, id };
    this.botConfigs.set(id, config);
    return config;
  }

  async updateBotConfig(id: number, configUpdate: Partial<InsertBotConfig>): Promise<BotConfig | undefined> {
    const config = this.botConfigs.get(id);
    if (!config) return undefined;

    const updatedConfig: BotConfig = { ...config, ...configUpdate };
    this.botConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  // Bot logs methods
  async getLogs(): Promise<BotLog[]> {
    return Array.from(this.logs.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async addLog(insertLog: InsertBotLog): Promise<BotLog> {
    const id = this.logId++;
    const log: BotLog = { 
      ...insertLog, 
      id, 
      timestamp: new Date()
    };
    this.logs.set(id, log);
    return log;
  }

  async clearLogs(): Promise<void> {
    this.logs.clear();
  }
}

export const storage = new MemStorage();
