// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:id', userController.updateProfile);
router.delete('/:id', userController.deleteProfile);
router.get('/:id', userController.showProfile)

module.exports = router;