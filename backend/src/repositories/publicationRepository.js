import {IUserDTO, IUserRepository, IUserResponse} from '../interfaces/userInterface';
import User from '../models/userModel';
import bcrypt from 'bcryptjs';

export class UserRepository implements IUserRepository {
    private mapToResponse(user): IUserResponse {
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            university: user.university
        };
    }

    async create(userDTO: IUserDTO): Promise<IUserResponse> {
        const hashedPassword = await bcrypt.hash(userDTO.password, 10);
        const user = new User({
            ...userDTO,
            password: hashedPassword
        });
        await user.save();
        return this.mapToResponse(user);
    }

    async findById(id: string): Promise<IUserResponse | null> {
        const user = await User.findById(id);
        return user ? this.mapToResponse(user) : null;
    }

    async findByUsername(username: string): Promise<IUserResponse | null> {
        const user = await User.findOne({username});
        return user ? this.mapToResponse(user) : null;
    }

    async findByEmail(email: string): Promise<IUserResponse | null> {
        const user = await User.findOne({email});
        return user ? this.mapToResponse(user) : null;
    }

    async update(id: string, userDTO: Partial<IUserDTO>): Promise<IUserResponse | null> {
        if (userDTO.password) {
            userDTO.password = await bcrypt.hash(userDTO.password, 10);
        }
        const user = await User.findByIdAndUpdate(id, userDTO, {new: true});
        return user ? this.mapToResponse(user) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await User.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async findAll(): Promise<IUserResponse[]> {
        const users = await User.find();
        return users.map((user) => this.mapToResponse(user));
    }

    async validateCredentials(username: string, password: string): Promise<IUserResponse | null> {
        const user = await User.findOne({username});
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? this.mapToResponse(user) : null;
    }
}