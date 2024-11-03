import express from 'express';
import {PublicationController} from '../controllers/publicationController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();
const publicationController = new PublicationController();


router.post('/', authMiddleware, publicationController.createPublication);
router.get('/', publicationController.getAllPublications);
router.get('/featured', publicationController.getFeaturedPublications);
router.get('/search', publicationController.searchPublications);
router.get('/:id', publicationController.getPublicationById);
router.put('/:id', authMiddleware, publicationController.updatePublication);
router.delete('/:id', authMiddleware, publicationController.deletePublication);
router.post('/:id/rate', authMiddleware, publicationController.ratePublication);
router.post('/:id/download', authMiddleware, publicationController.downloadPublication);

export default router;
