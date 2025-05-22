import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertGuideSchema, insertBotConfigSchema, insertBotLogSchema } from "@shared/schema";
import { startDiscordBot, updateGuideMenu, deployNewGuideMenu, reconnectBot } from "./discord-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize Discord bot when server starts
  startDiscordBot();

  // === Guide Routes ===
  // Get all guides
  app.get('/api/guides', async (req: Request, res: Response) => {
    try {
      const guides = await storage.getGuides();
      res.json(guides);
    } catch (error) {
      console.error('Error fetching guides:', error);
      res.status(500).json({ message: 'Failed to fetch guides' });
    }
  });

  // Get guide by ID
  app.get('/api/guides/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid guide ID' });
      }

      const guide = await storage.getGuide(id);
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }

      res.json(guide);
    } catch (error) {
      console.error('Error fetching guide:', error);
      res.status(500).json({ message: 'Failed to fetch guide' });
    }
  });

  // Create new guide
  app.post('/api/guides', async (req: Request, res: Response) => {
    try {
      const validatedData = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(validatedData);
      await storage.addLog({
        message: `Guide created: '${guide.label}'`,
        level: 'info'
      });
      res.status(201).json(guide);
    } catch (error) {
      console.error('Error creating guide:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid guide data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create guide' });
    }
  });

  // Update guide
  app.put('/api/guides/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid guide ID' });
      }

      const validatedData = insertGuideSchema.partial().parse(req.body);
      const updatedGuide = await storage.updateGuide(id, validatedData);
      
      if (!updatedGuide) {
        return res.status(404).json({ message: 'Guide not found' });
      }

      await storage.addLog({
        message: `Guide updated: '${updatedGuide.label}'`,
        level: 'warning'
      });
      
      res.json(updatedGuide);
    } catch (error) {
      console.error('Error updating guide:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid guide data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update guide' });
    }
  });

  // Delete guide
  app.delete('/api/guides/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid guide ID' });
      }

      const guide = await storage.getGuide(id);
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }

      await storage.deleteGuide(id);
      
      await storage.addLog({
        message: `Guide deleted: '${guide.label}'`,
        level: 'warning'
      });
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting guide:', error);
      res.status(500).json({ message: 'Failed to delete guide' });
    }
  });

  // === Bot Config Routes ===
  // Get bot configuration
  app.get('/api/bot-config', async (req: Request, res: Response) => {
    try {
      const config = await storage.getBotConfig();
      if (!config) {
        return res.status(404).json({ message: 'Bot configuration not found' });
      }
      
      // Don't send the actual token for security reasons
      const sanitizedConfig = {
        ...config,
        botToken: config.botToken ? '●●●●●●●●●●●●●●●●●●●●' : undefined
      };
      
      res.json(sanitizedConfig);
    } catch (error) {
      console.error('Error fetching bot config:', error);
      res.status(500).json({ message: 'Failed to fetch bot configuration' });
    }
  });

  // Update bot configuration
  app.put('/api/bot-config/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid config ID' });
      }

      const validatedData = insertBotConfigSchema.partial().parse(req.body);
      const updatedConfig = await storage.updateBotConfig(id, validatedData);
      
      if (!updatedConfig) {
        return res.status(404).json({ message: 'Bot configuration not found' });
      }

      await storage.addLog({
        message: 'Bot configuration updated',
        level: 'info'
      });
      
      // Don't send the actual token for security reasons
      const sanitizedConfig = {
        ...updatedConfig,
        botToken: updatedConfig.botToken ? '●●●●●●●●●●●●●●●●●●●●' : undefined
      };
      
      res.json(sanitizedConfig);
    } catch (error) {
      console.error('Error updating bot config:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid config data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update bot configuration' });
    }
  });

  // Reconnect bot
  app.post('/api/bot/reconnect', async (req: Request, res: Response) => {
    try {
      await reconnectBot();
      await storage.addLog({
        message: 'Bot reconnected successfully',
        level: 'success'
      });
      res.json({ message: 'Bot reconnected successfully' });
    } catch (error) {
      console.error('Error reconnecting bot:', error);
      await storage.addLog({
        message: `Failed to reconnect bot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        level: 'error'
      });
      res.status(500).json({ message: 'Failed to reconnect bot' });
    }
  });

  // Deploy new guide menu
  app.post('/api/bot/deploy-menu', async (req: Request, res: Response) => {
    try {
      const result = await deployNewGuideMenu();
      await storage.addLog({
        message: `New guide menu deployed to channel ${result.channelId}`,
        level: 'success'
      });
      res.json({ 
        message: 'Guide menu deployed successfully',
        messageId: result.messageId
      });
    } catch (error) {
      console.error('Error deploying guide menu:', error);
      await storage.addLog({
        message: `Failed to deploy guide menu: ${error instanceof Error ? error.message : 'Unknown error'}`,
        level: 'error'
      });
      res.status(500).json({ message: 'Failed to deploy guide menu' });
    }
  });

  // Update existing guide menu
  app.post('/api/bot/update-menu', async (req: Request, res: Response) => {
    try {
      const result = await updateGuideMenu();
      if (!result.updated) {
        return res.status(404).json({ message: 'No existing menu found to update' });
      }
      
      await storage.addLog({
        message: 'Guide menu updated successfully',
        level: 'success'
      });
      
      res.json({ message: 'Guide menu updated successfully' });
    } catch (error) {
      console.error('Error updating guide menu:', error);
      await storage.addLog({
        message: `Failed to update guide menu: ${error instanceof Error ? error.message : 'Unknown error'}`,
        level: 'error'
      });
      res.status(500).json({ message: 'Failed to update guide menu' });
    }
  });

  // === Logs Routes ===
  // Get all logs
  app.get('/api/logs', async (req: Request, res: Response) => {
    try {
      const logs = await storage.getLogs();
      res.json(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ message: 'Failed to fetch logs' });
    }
  });

  // Add new log
  app.post('/api/logs', async (req: Request, res: Response) => {
    try {
      const validatedData = insertBotLogSchema.parse(req.body);
      const log = await storage.addLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      console.error('Error adding log:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid log data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to add log' });
    }
  });

  // Clear all logs
  app.delete('/api/logs', async (req: Request, res: Response) => {
    try {
      await storage.clearLogs();
      await storage.addLog({
        message: 'Logs cleared',
        level: 'info'
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error clearing logs:', error);
      res.status(500).json({ message: 'Failed to clear logs' });
    }
  });

  // Export logs (return all logs in JSON format for download)
  app.get('/api/logs/export', async (req: Request, res: Response) => {
    try {
      const logs = await storage.getLogs();
      res.setHeader('Content-Disposition', 'attachment; filename=discord-bot-logs.json');
      res.setHeader('Content-Type', 'application/json');
      res.json(logs);
    } catch (error) {
      console.error('Error exporting logs:', error);
      res.status(500).json({ message: 'Failed to export logs' });
    }
  });

  return httpServer;
}
