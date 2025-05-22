export const LOG_LEVELS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const DEFAULT_GUIDES = [
  {
    label: "How to use the Shop",
    content: `# Shop Guide\n\nThe shop offers various items that you can purchase with your in-game currency.\n\n## Commands\n- \`/shop\` - Opens the shop menu\n- \`/shop buy [item]\` - Purchases an item\n- \`/shop sell [item]\` - Sells an item\n\n## Available Categories\n- 🗡️ **Weapons**\n- 🛡️ **Armor**\n- 🧪 **Potions**\n- 📜 **Scrolls**\n\n*Remember: Some items have level requirements!*`,
    topicKey: "shop"
  },
  {
    label: "Zorp Commands Guide",
    content: `# Zorp Commands Guide\n\nZorp is a multifunctional bot with many useful commands.\n\n## Basic Commands\n- \`/zorp help\` - Shows this help menu\n- \`/zorp ping\` - Checks if Zorp is online\n- \`/zorp stats\` - Shows your stats\n\n## Advanced Commands\n- \`/zorp config\` - Configure Zorp for your server\n- \`/zorp roles\` - Manage roles with Zorp\n- \`/zorp events\` - Create and manage events\n\n*For more information, visit our documentation at zorp.gg/docs*`,
    topicKey: "zorp"
  },
  {
    label: "How to Link Accounts",
    content: `# Account Linking Guide\n\nLink your accounts to access additional features and benefits.\n\n## Linking Steps\n1. Go to your profile settings\n2. Click on "Linked Accounts"\n3. Select the platform you want to link\n4. Follow the authentication process\n\n## Supported Platforms\n- 🎮 **Discord**\n- 🎯 **Steam**\n- 🎬 **Twitch**\n- 📱 **Mobile**\n\n*Linking accounts gives you access to exclusive rewards!*`,
    topicKey: "link"
  }
];
