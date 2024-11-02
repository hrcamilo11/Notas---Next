// eslint-disable-next-line @typescript-eslint/no-require-imports
const userRepository = require('../repositories/userRepository');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require('jsonwebtoken');

class UserController {
    async register(req, res) {
        try {
            const { username, password, email, university } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await userRepository.create({
                username,
                password: hashedPassword,
                email,
                university
            });
            res.status(201).json({ message: 'User registered successfully', user: user });
        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            // Buscar el usuario en la base de datos
            const user = await userRepository.findByUsername(username);
            if (!user) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            // Comparar la contraseña proporcionada con la almacenada
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            // Crear un token JWT
            const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });

            // Devolver el token y la información del usuario (sin la contraseña)
            res.status(200).json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email, university: user.university } });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { username, email, university } = req.body;
            const userId = req.user.id; // Suponiendo que el ID del usuario está en el token JWT

            // Crear un objeto con los campos a actualizar
            const updatedFields = {};
            if (username) updatedFields.username = username;
            if (email) updatedFields.email = email;
            if (university) updatedFields.university = university;

            // Actualizar el perfil del usuario en la base de datos
            const updatedUser  = await userRepository.update(userId, updatedFields);

            if (!updatedUser ) {
                return res.status(404).json({ message: 'User  not found' });
            }

            // Devolver la información actualizada del usuario (sin la contraseña)
            res.status(200).json({ message: 'Profile updated successfully', user: { id: updatedUser .id, username: updatedUser .username, email: updatedUser .email, university: updatedUser .university } });
        } catch (error) {
            res.status(500).json({ message: 'Error updating profile', error: error.message });
        }
    }

    async showProfile(req, res) {
        try {
            const userId = req.user.id; // Suponiendo que el ID del usuario está en el token JWT

            // Buscar el usuario en la base de datos
            const user = await userRepository.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User  not found' });
            }

            // Devolver la información del usuario (sin la contraseña)
            res.status(200).json({
                message: 'User  profile retrieved successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    university: user.university
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
        }
    }

    async deleteProfile(req, res) {
        try {
            const userId = req.user.id; // Suponiendo que el ID del usuario está en el token JWT

            // Eliminar el usuario de la base de datos
            const deletedUser  = await userRepository.delete(userId);

            if (!deletedUser ) {
                return res.status(404).json({ message: 'User  not found' });
            }

            // Devolver un mensaje de éxito
            res.status(200).json({ message: 'User  profile deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user profile', error: error.message });
        }
    }
}

module.exports = new UserController();