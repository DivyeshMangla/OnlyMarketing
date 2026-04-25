// contact.routes.ts — Route definitions for contact management; secured by authMiddleware.
import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { authMiddleware } from '../../shared/auth.middleware';
import { getByOrg, getById, addContact, editContact, removeContact } from './contact.controller';

const router = Router();

router.get('/details/:id', authMiddleware, asyncHandler(getById));
router.get('/:orgId', authMiddleware, asyncHandler(getByOrg));
router.post('/', authMiddleware, asyncHandler(addContact));
router.put('/:id', authMiddleware, asyncHandler(editContact));
router.delete('/:id', authMiddleware, asyncHandler(removeContact));

export default router;
