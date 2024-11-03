import express from 'express';
import {PublicationController} from '../controllers/publicationController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();
const publicationController = new PublicationController();

// @ts-expect-error: err
router.post('/', authMiddleware, publicationController.createPublication);
router.get('/', publicationController.getAllPublications);
router.get('/featured', publicationController.getFeaturedPublications);
router.get('/search', publicationController.searchPublications);
// @ts-expect-error: err
router.get('/:id', publicationController.getPublicationById);
// @ts-expect-error: err
router.put('/:id', authMiddleware, publicationController.updatePublication);
// @ts-expect-error: err
router.delete('/:id', authMiddleware, publicationController.deletePublication);
// @ts-expect-error: err
router.post('/:id/rate', authMiddleware, publicationController.ratePublication);
// @ts-expect-error: err
router.post('/:id/download', authMiddleware, publicationController.downloadPublication);

export default router;
