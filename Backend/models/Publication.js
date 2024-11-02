// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number
});

const publicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    university: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    featured: { type: Boolean, default: false },
    file: { type: String }, // This will store the file path or URL
    ratings: [ratingSchema],
    downloadCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Publication', publicationSchema);