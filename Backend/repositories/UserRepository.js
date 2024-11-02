// eslint-disable-next-line @typescript-eslint/no-require-imports
const User = require('../models/User');

class UserRepository {
    async create(userData) {
        const user = new User(userData);
        return user.save();
    }

    async findByUsername(email) {
        return User.findOne({ email });
    }

    async findById(id) {
        return User.findById(id);
    }

    async update(id, updateData) {
        return User.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return User.findByIdAndDelete(id);
    }

    async showProfile(id){
        return User.findById(id);
    }
}

module.exports = new UserRepository();