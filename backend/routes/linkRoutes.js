import express from 'express';
import { createLink, getLinks, getLinkById, updateLink, deleteLink } from '../controllers/linkController.js';
import protect from '../middleware/auth.js';
import { linkCreationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.route('/')
  .post(protect, linkCreationLimiter, createLink)
  .get(protect, getLinks);

router.route('/:id')
  .get(protect, getLinkById)
  .put(protect, updateLink)
  .delete(protect, deleteLink);

export default router;
