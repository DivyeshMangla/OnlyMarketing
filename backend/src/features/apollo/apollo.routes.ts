// apollo.routes.ts — Route definitions for admin-only Apollo.io search.
import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { authMiddleware } from '../../shared/auth.middleware';
import { searchCompanies, searchContacts } from './apollo.controller';

const router = Router();

router.get('/companies', authMiddleware, asyncHandler(searchCompanies));
router.get('/contacts', authMiddleware, asyncHandler(searchContacts));

export default router;
