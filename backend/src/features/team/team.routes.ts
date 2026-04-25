// team.routes.ts — Route definitions for team member management.
import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { authMiddleware } from '../../shared/auth.middleware';
import { listTeam, setUserRole, removeMember } from './team.controller';

const router = Router();

router.get('/', authMiddleware, asyncHandler(listTeam));
router.put('/:id/role', authMiddleware, asyncHandler(setUserRole));
router.delete('/:id', authMiddleware, asyncHandler(removeMember));

export default router;
