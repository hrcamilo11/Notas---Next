import express from 'express';
import {UserController} from '../controllers/userController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';

const router = express.Router();
const userController = new UserController();


router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

export default router;
