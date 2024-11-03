import User from '../models/userModel';
import bcrypt from 'bcryptjs';

export class UserService {
    async registerUser(username: string, email: string, password: string, university: string) {
        const existingUser = await User.findOne({$or: [{username}, {email}]});
        if (existingUser) throw new Error('Username or email already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({username, email, password: hashedPassword, university});
        return await newUser.save();
    }

    async loginUser(username: string, password: string) {
        const user = await User.findOne({username});
        if (!user) throw new Error('Invalid credentials');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error('Invalid credentials');

        return user; // Retorna el usuario para el manejo del token después
    }

    async getUserById(id: string) {
        return await User.findById(id);
    }

    // Agregar otras funciones como actualizar usuario, eliminar usuario, etc.
}
