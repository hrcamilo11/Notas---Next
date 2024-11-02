// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const publicationController = require('../controllers/publicationController');
const router = express.Router();

router.post('/', publicationController.create);
router.get('/', publicationController.getAll);
router.get('/:id', publicationController.getById);
router.put('/:id', publicationController.update);
router.delete('/:id', publicationController.delete);
router.post('/:id/rate', publicationController.addRating);
router.post('/:id/download', publicationController.incrementDownloadCount);

module.exports = router;