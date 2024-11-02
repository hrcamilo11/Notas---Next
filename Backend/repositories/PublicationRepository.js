// eslint-disable-next-line @typescript-eslint/no-require-imports
const Publication = require('../models/Publication');

class PublicationRepository {
    async create(publicationData) {
        const publication = new Publication(publicationData);
        return await publication.save();
    }

    async findAll() {
        return await Publication.find().populate('author', 'username');
    }

    async findById(id) {
        return await Publication.findById(id).populate('author', 'username');
    }

    async update(id, updateData) {
        return await Publication.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Publication.findByIdAndDelete(id);
    }

    async addRating(id, rating) {
        return await Publication.findByIdAndUpdate(
            id,
            { $push: { ratings: rating } },
            { new: true }
        );
    }

    async incrementDownloadCount(id) {
        return await Publication.findByIdAndUpdate(
            id,
            { $inc: { downloadCount: 1 } },
            { new: true }
        );
    }
}

module.exports = new PublicationRepository();