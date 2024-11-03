import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export class UserController {

    // Registrar un nuevo usuario
    async registerUser(req, res) {
        try {
            const {username, email, password, university} = req.body;

            const existingUser = await User.findOne({$or: [{username}, {email}]});
            if (existingUser) {
                return res.status(400).json({message: 'Username or email already exists'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({username, email, password: hashedPassword, university});
            await newUser.save();

            res.status(201).json({message: 'User registered successfully'});
        } catch (error) {
            res.status(500).json({message: 'Error registering user', error});
        }
    }

    // Iniciar sesión
    async loginUser(req, res) {
        try {
            const {username, password} = req.body;
            const user = await User.findOne({username});
            if (!user) {
                return res.status(400).json({message: 'Invalid credentials'});
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({message: 'Invalid credentials'});
            }

            const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
            res.json({token, userId: user._id});
        } catch (error) {
            res.status(500).json({message: 'Error logging in', error});
        }
    }

    // Obtener todos los usuarios
    async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password'); // Excluyendo la contraseña
            res.json(users);
        } catch (error) {
            res.status(500).json({message: 'Error fetching users', error});
        }
    }

    // Obtener un usuario por ID
    async getUserById(req, res) {
        try {
            const {id} = req.params;
            const user = await User.findById(id).select('-password'); // Excluyendo la contraseña
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({message: 'Error fetching user', error});
        }
    }

    // Actualizar un usuario
    async updateUser(req, res) {
        try {
            const {id} = req.params;
            const updates = req.body;
            const user = await User.findByIdAndUpdate(id, updates, {new: true}).select('-password'); // Excluyendo la contraseña
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            res.json({message: 'User updated successfully', user});
        } catch (error) {
            res.status(500).json({message: 'Error updating user', error});
        }
    }

    // Eliminar un usuario
    async deleteUser(req, res) {
        try {
            const {id} = req.params;
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            res.json({message: 'User deleted successfully'});
        } catch (error) {
            res.status(500).json({message: 'Error deleting user', error});
        }
    }
}
