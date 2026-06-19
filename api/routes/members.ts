import { Router } from 'express';
import * as memberController from '../controllers/memberController.js';

const router = Router();

router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);
router.post('/', memberController.createMember);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);
router.patch('/:id/confirm', memberController.confirmMember);

export default router;
