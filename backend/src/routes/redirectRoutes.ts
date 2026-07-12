import express from 'express';
import { handleRedirect } from '../controllers/redirectController';

const router = express.Router();

router.get('/:slug', handleRedirect);

export default router;
