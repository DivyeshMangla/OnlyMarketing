// server.ts — Entry point for the Express application; initializes middleware, routes, and database connection.
// config must be imported first — validates required env vars before anything else runs
import 'dotenv/config';
import { config } from './config';

import express from 'express';
import cors from 'cors';

import { connectDB } from './db';
import { errorHandler } from './shared/errorHandler';

import authRoutes from './features/auth/auth.routes';
import contactRoutes from './features/contacts/contact.routes';
import orgRoutes from './features/organizations/organization.routes';
import teamRoutes from './features/team/team.routes';

const BODY_LIMIT = '10mb';

const app = express();

app.use(express.json({ limit: BODY_LIMIT }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/team', teamRoutes);

// Central error handler — must be last middleware registered
app.use(errorHandler);

/**
 * Initializes database connection and starts the HTTP server.
 * @returns Promise resolving when the server is ready.
 */
async function start(): Promise<void> {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
  });
}

start();
