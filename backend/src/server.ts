// server.ts — Entry point for the Express application; initializes middleware, routes, and database connection.
import 'dotenv/config';
import { config } from './config';
import express from 'express';
import cors from 'cors';
import path from 'path';
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

// 1. API Routes (Check these first)
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/team', teamRoutes);

// 2. Static Files (Check for actual files on disk)
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

// 3. React Fallback (If nothing else matches, send index.html)
app.get('*', (req, res) => {
  // If it's an unrecognized /api route, don't send index.html
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route not found' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 4. Central error handler
app.use(errorHandler);

async function start(): Promise<void> {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
    console.log(`📂 Serving static files from: ${publicPath}`);
  });
}

start();
