// eslint-disable-next-line @typescript-eslint/no-require-imports
const publicationRepository = require('../repositories/publicationRepository');

class PublicationController {
    async create(req, res) {
        try {
            const publicationData = req.body;
            const publication = await publicationRepository.create(publicationData);
            res.status(201).json(publication);
        } catch (error) {
            res.status(500).json({ message: 'Error creating publication', error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const publications = await publicationRepository.findAll();
            res.json(publications);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching publications', error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const publication = await publicationRepository.findById(id);
            if (!publication) {
                return res.status(404).json({ message: 'Publication not found' });
            }
            res.json(publication);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching publication', error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedPublication = await publicationRepository.update(id, updateData);
            res.json(updatedPublication);
        } catch (error) {
            res.status(500).json({ message: 'Error updating publication', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await publicationRepository.delete(id);
            res.json({ message: 'Publication deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting publication', error: error.message });
        }
    }

    async addRating(req, res) {
        try {
            const { id } = req.params;
            const { userId, rating } = req.body;
            const updatedPublication = await publicationRepository.addRating(id, { userId, rating });
            res.json(updatedPublication);
        } catch (error) {
            res.status(500).json({ message: 'Error adding rating', error: error.message });
        }
    }

    async incrementDownloadCount(req, res) {
        try {
            const { id } = req.params;
            const updatedPublication = await publicationRepository.incrementDownloadCount(id);
            res.json(updatedPublication);
        } catch (error) {
            res.status(500).json({ message: 'Error incrementing download count', error: error.message });
        }
    }
}

module.exports = new PublicationController();