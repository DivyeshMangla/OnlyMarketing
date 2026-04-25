// organization.routes.ts — Route definitions for organization management.
import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { authMiddleware } from '../../shared/auth.middleware';
import { 
  listOrgs, 
  addOrg, 
  editOrg, 
  discoverOrgs, 
  submitJoinRequest, 
  updateMemberStatus, 
  deleteMember,
  removeOrg
} from './organization.controller';

const router = Router();

router.get('/', authMiddleware, asyncHandler(listOrgs));
router.get('/discover', authMiddleware, asyncHandler(discoverOrgs));
router.post('/', authMiddleware, asyncHandler(addOrg));
router.post('/:id/request', authMiddleware, asyncHandler(submitJoinRequest));
router.put('/:id', authMiddleware, asyncHandler(editOrg));
router.put('/:id/members/:userId', authMiddleware, asyncHandler(updateMemberStatus));
router.delete('/:id', authMiddleware, asyncHandler(removeOrg));
router.delete('/:id/members/:userId', authMiddleware, asyncHandler(deleteMember));

export default router;
