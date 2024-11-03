// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    university: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);


