import { Router } from 'express';
import { getAllRecords } from '../controllers/recordController.js';

const router = Router();

router.get('/', getAllRecords);

export default router;
