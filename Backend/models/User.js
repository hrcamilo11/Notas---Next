// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    university: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);