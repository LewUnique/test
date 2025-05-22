export interface Guide {
  id: number;
  label: string;
  content: string;
  topicKey: string;
}

export interface BotConfig {
  id: number;
  botToken: string;
  targetChannelId: string;
  messageId?: string;
  lastDeployed?: Date;
}

export interface BotLog {
  id: number;
  timestamp: Date;
  message: string;
  level: string;
}
