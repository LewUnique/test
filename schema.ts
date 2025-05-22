import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Discord bot related schemas
export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  content: text("content").notNull(),
  topicKey: text("topic_key").notNull().unique(),
});

export const insertGuideSchema = createInsertSchema(guides).pick({
  label: true,
  content: true,
  topicKey: true,
});

export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guides.$inferSelect;

export const botConfig = pgTable("bot_config", {
  id: serial("id").primaryKey(),
  botToken: text("bot_token").notNull(),
  targetChannelId: text("target_channel_id").notNull(),
  messageId: text("message_id"),
  lastDeployed: timestamp("last_deployed"),
});

export const insertBotConfigSchema = createInsertSchema(botConfig).pick({
  botToken: true,
  targetChannelId: true,
  messageId: true,
  lastDeployed: true,
});

export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;
export type BotConfig = typeof botConfig.$inferSelect;

export const botLogs = pgTable("bot_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  message: text("message").notNull(),
  level: text("level").notNull(),
});

export const insertBotLogSchema = createInsertSchema(botLogs).pick({
  message: true,
  level: true,
});

export type InsertBotLog = z.infer<typeof insertBotLogSchema>;
export type BotLog = typeof botLogs.$inferSelect;
