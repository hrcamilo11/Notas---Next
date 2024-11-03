// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');

const PublicationSchema = new mongoose.Schema({
    name: {type: String, required: true},
    subject: {type: String, required: true},
    university: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    file: {
        filename: String,
        contentType: String,
        length: Number,
        uploadDate: Date,
    },
    featured: {type: Boolean, default: false},
    downloadCount: {type: Number, default: 0},
    ratings: [{
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        rating: Number,
    }],
}, {timestamps: true});

module.exports = mongoose.model('Publication', PublicationSchema);
