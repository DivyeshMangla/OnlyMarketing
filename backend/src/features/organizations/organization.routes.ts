// organization.routes.ts — Route definitions for organization management.
import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { authMiddleware } from '../../shared/auth.middleware';
import { listOrgs, addOrg, editOrg } from './organization.controller';

const router = Router();

router.get('/', authMiddleware, asyncHandler(listOrgs));
router.post('/', authMiddleware, asyncHandler(addOrg));
router.put('/:id', authMiddleware, asyncHandler(editOrg));

export default router;
