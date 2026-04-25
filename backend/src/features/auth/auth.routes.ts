// auth.routes.ts — Route definitions for authentication; connects endpoints to their respective controller handlers.
import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { authMiddleware } from '../../shared/auth.middleware';
import { register, login, getMe, updateMe } from './auth.controller';

/**
 * Auth routes — this file only wires middleware + controller functions.
 * No business logic lives here.
 */
const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(getMe));
router.put('/me', authMiddleware, asyncHandler(updateMe));

export default router;
