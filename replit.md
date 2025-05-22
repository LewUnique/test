# Discord Guide Bot Admin Panel

## Overview

This project is a Discord bot management system with a web admin panel. It allows users to create and manage guides that can be accessed through a Discord bot using dropdown menu interactions. The application consists of a React frontend, an Express backend, and integrates with Discord's API to deploy and manage interactive help guides within Discord servers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

This application follows a modern full-stack architecture:

- **Frontend**: React-based SPA with TypeScript, using Shadcn UI components and TailwindCSS
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL (using Drizzle ORM for database management)
- **External Integrations**: Discord.js for Discord bot functionality

The application is structured as a monorepo, with client and server code separated in their respective directories, and shared code in a `shared` directory. This allows type sharing and ensures data consistency across the stack.

## Key Components

### Frontend

1. **React Application**
   - Built with React, TypeScript, and Vite
   - Uses React Query for data fetching and state management
   - Uses Wouter for routing
   - Uses Shadcn UI components (built on Radix UI primitives)
   - Styled with TailwindCSS

2. **Admin Panel**
   - Main interface for managing guide content
   - ConfigPanel: For managing bot configuration
   - PreviewPanel: Shows a preview of how guides will appear in Discord
   - LogsPanel: Displays bot activity logs

3. **Theme System**
   - Light/dark mode support with CSS variables
   - Persistent theme preferences using localStorage

### Backend

1. **Express Server**
   - Handles API routes and serves the frontend in production
   - Implements RESTful endpoints for guide and bot management
   - Handles bot deployment and reconnection

2. **Discord Bot Integration**
   - Uses Discord.js library to interact with Discord's API
   - Manages message components (dropdown menus) for guide selection
   - Responds to user interactions and serves guide content

3. **Storage System**
   - Abstract storage interface with implementations for different environments
   - Handles persistence of guides, bot configuration, and logs

### Database

1. **Schema**
   - Users: Basic user authentication for admin access
   - Guides: Content that will be displayed by the bot
   - BotConfig: Storage for bot token and configuration
   - BotLogs: Activity and error tracking

2. **ORM**
   - Uses Drizzle ORM for type-safe database access
   - Includes schema validation with Zod integration

## Data Flow

1. **Guide Creation/Update**
   - Admin creates/edits guide content through the admin panel
   - Frontend sends data to backend API
   - Backend validates and stores guide in the database
   - Bot can be instructed to update its dropdown menu with new guides

2. **Bot Deployment**
   - Admin configures bot token and target Discord channel
   - Backend initializes the Discord bot with the provided token
   - Bot connects to Discord and posts a message with guide selection options
   - Backend stores the message ID for future updates

3. **User Interaction in Discord**
   - Discord users select guides from the dropdown menu
   - Bot receives interaction events
   - Bot responds with the selected guide content
   - Activity is logged in the database

## External Dependencies

1. **Discord API**
   - Used for bot authentication and interactions
   - Requires a bot token with appropriate permissions

2. **UI Components**
   - Shadcn UI - High-quality React components based on Radix UI
   - Radix UI - Unstyled, accessible component primitives
   - TailwindCSS - Utility-first CSS framework

3. **Database**
   - PostgreSQL database (provided by Replit)
   - Neon Serverless PostgreSQL driver for database connections

## Deployment Strategy

The application is configured to deploy on Replit with:

1. **Development Mode**
   - Run with `npm run dev` - handled by the Replit run button
   - Vite provides hot module replacement and development tools

2. **Production Build**
   - Frontend is built with Vite (`vite build`)
   - Backend is bundled with esbuild
   - Static assets are served by Express

3. **Database Setup**
   - PostgreSQL instance is provided by Replit
   - Schema migrations can be applied with `npm run db:push`
   - Connection is configured through environment variables

## Getting Started

1. **Environment Setup**
   - Ensure `DATABASE_URL` environment variable is set
   - Set up Discord bot token as `DISCORD_BOT_TOKEN` environment variable
   - Set the target Discord channel ID as `DISCORD_CHANNEL_ID`

2. **Development Workflow**
   - Run `npm run dev` to start the development server
   - Access the admin panel at http://localhost:5000
   - Create guides and configure the bot through the UI

3. **Bot Setup**
   - Create a Discord bot in the Discord Developer Portal
   - Generate a bot token and add it to the application
   - Invite the bot to your server with the appropriate permissions
   - Use the admin panel to deploy the bot to a specific channel

## Common Tasks

1. **Creating a new guide**
   - Navigate to the admin panel
   - Use the guide editor to create a new guide with a label, content, and unique topic key
   - Deploy the bot to update the guide menu

2. **Updating bot configuration**
   - Use the configuration panel to update the bot token or target channel
   - Reconnect the bot to apply changes

3. **Viewing logs**
   - The logs panel shows recent bot activity and errors
   - Logs can be exported for troubleshooting