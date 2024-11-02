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
            res.status(201).json({ message: 'User registered successfully', userId: user._id });
        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userRepository.findByUsername(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ token, user: { id: user._id, username: user.username, email: user.email, university: user.university } });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { id } = req.params;
            const { university, newPassword } = req.body;
            let updateData = { university, newPassword };
            if (newPassword) {
                updateData.password = await bcrypt.hash(newPassword, 10);
            }
            const updatedUser = await userRepository.update(id, updateData);
            res.json({ message: 'Profile updated successfully', user: updatedUser });
        } catch (error) {
            res.status(500).json({ message: 'Error updating profile', error: error.message });
        }
    }

    async showProfile(req, res){
        try {
            const { id } = req.params;
            const user = await userRepository.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ user });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching profile', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedUser = await userRepository.delete(id);
            res.json({ message: 'Profile deleted successfully', user: deletedUser });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting profile', error: error.message });
        }
    }
}

module.exports = new UserController();