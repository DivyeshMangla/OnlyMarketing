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

// 1. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/team', teamRoutes);

// 2. Static Files
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

// 3. React Fallback (Catch-all Middleware)
// This is placed AFTER API routes and static files. 
// If a request reaches here, it means it's not an API call or a physical file.
app.use((req, res, next) => {
  // If it's an unrecognized /api route, return 404 instead of index.html
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route not found' });
  }
  // Serve React index.html for all other routes (handles client-side routing)
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
