import express from 'express';
import {UserController} from '../controllers/userController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();
const userController = new UserController();

// @ts-expect-error: err
router.post('/register', userController.registerUser);
// @ts-expect-error: err
router.post('/login', userController.loginUser);
// @ts-expect-error: err
router.get('/', authMiddleware, userController.getAllUsers);
// @ts-expect-error: err
router.get('/:id', authMiddleware, userController.getUserById);
// @ts-expect-error: err
router.put('/:id', authMiddleware, userController.updateUser);
// @ts-expect-error: err
router.delete('/:id', authMiddleware, userController.deleteUser);

export default router;
