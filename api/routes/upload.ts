import { Router } from 'express';
import * as uploadController from '../controllers/uploadController';

const router = Router();

router.post('/', uploadController.uploadPhoto);

export default router;
