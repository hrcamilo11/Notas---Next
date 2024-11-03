import Publication from '../models/publicationModel.js';

export class PublicationController {

    // Crear una publicación
    async createPublication(req, res) {
        try {
            const {name, subject, university} = req.body;
            const author = req.user?.id; // Asumiendo que el middleware de autenticación añade el ID del usuario

            const newPublication = new Publication({
                name,
                subject,
                university,
                author,
                // Aquí podrías añadir manejo de archivos, si es necesario
            });

            await newPublication.save();
            res.status(201).json({message: 'Publication created successfully', publication: newPublication});
        } catch (error) {
            res.status(500).json({message: 'Error creating publication', error});
        }
    }

    // Obtener todas las publicaciones
    async getAllPublications(req, res) {
        try {
            const publications = await Publication.find().populate('author', 'username');
            res.json(publications);
        } catch (error) {
            res.status(500).json({message: 'Error fetching publications', error});
        }
    }

    // Obtener una publicación por ID
    async getPublicationById(req, res) {
        try {
            const {id} = req.params;
            const publication = await Publication.findById(id).populate('author', 'username');
            if (!publication) {
                return res.status(404).json({message: 'Publication not found'});
            }
            res.json(publication);
        } catch (error) {
            res.status(500).json({message: 'Error fetching publication', error});
        }
    }

    // Actualizar una publicación
    async updatePublication(req, res) {
        try {
            const {id} = req.params;
            const updates = req.body;
            const publication = await Publication.findByIdAndUpdate(id, updates, {new: true}).populate('author', 'username');
            if (!publication) {
                return res.status(404).json({message: 'Publication not found'});
            }
            res.json({message: 'Publication updated successfully', publication});
        } catch (error) {
            res.status(500).json({message: 'Error updating publication', error});
        }
    }

    // Eliminar una publicación
    async deletePublication(req, res) {
        try {
            const {id} = req.params;
            const publication = await Publication.findByIdAndDelete(id);
            if (!publication) {
                return res.status(404).json({message: 'Publication not found'});
            }
            res.json({message: 'Publication deleted successfully'});
        } catch (error) {
            res.status(500).json({message: 'Error deleting publication', error});
        }
    }

    // Obtener publicaciones destacadas
    async getFeaturedPublications(req, res) {
        try {
            const publications = await Publication.find({featured: true}).populate('author', 'username');
            res.json(publications);
        } catch (error) {
            res.status(500).json({message: 'Error fetching featured publications', error});
        }
    }

    // Incrementar el contador de descargas
    async downloadPublication(req, res) {
        try {
            const {id} = req.params;
            const publication = await Publication.findByIdAndUpdate(
                id,
                {$inc: {downloadCount: 1}},
                {new: true}
            );
            if (!publication) {
                return res.status(404).json({message: 'Publication not found'});
            }
            res.json({message: 'Download count incremented', publication});
        } catch (error) {
            res.status(500).json({message: 'Error incrementing download count', error});
        }
    }

    // Añadir una calificación
    async ratePublication(req, res) {
        try {
            const {id} = req.params;
            const {rating} = req.body;
            const userId = req.user?.id;

            const publication = await Publication.findById(id);
            if (!publication) {
                return res.status(404).json({message: 'Publication not found'});
            }

            // Agregar la calificación
            // @ts-expect-error: err
            publication.ratings.push({userId, rating});
            await publication.save();

            res.json({message: 'Publication rated successfully', publication});
        } catch (error) {
            res.status(500).json({message: 'Error rating publication', error});
        }
    }

    // Buscar publicaciones
    async searchPublications(req, res) {
        try {
            const {query} = req.query;
            const publications = await Publication.find({
                $or: [
                    {name: {$regex: query, $options: 'i'}},
                    {subject: {$regex: query, $options: 'i'}},
                    {university: {$regex: query, $options: 'i'}}
                ]
            }).populate('author', 'username');

            res.json(publications);
        } catch (error) {
            res.status(500).json({message: 'Error searching publications', error});
        }
    }
}
