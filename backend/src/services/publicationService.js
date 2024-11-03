import Publication, {IPublication} from '../models/publicationModel';

export class PublicationService {
    async createPublication(data: Partial<IPublication>, authorId: string) {
        const newPublication = new Publication({...data, author: authorId});
        return await newPublication.save();
    }

    async getAllPublications() {
        return await Publication.find().populate('author', 'username');
    }

    async getPublicationById(id: string) {
        return await Publication.findById(id).populate('author', 'username');
    }

    async updatePublication(id: string, updates: Partial<IPublication>) {
        return await Publication.findByIdAndUpdate(id, updates, {new: true}).populate('author', 'username');
    }

    async deletePublication(id: string) {
        return await Publication.findByIdAndDelete(id);
    }

    async getFeaturedPublications() {
        return await Publication.find({featured: true}).populate('author', 'username');
    }

    async incrementDownloadCount(id: string) {
        return await Publication.findByIdAndUpdate(id, {$inc: {downloadCount: 1}}, {new: true});
    }

    async ratePublication(id: string, userId: string, rating: number) {
        const publication = await Publication.findById(id);
        if (!publication) throw new Error('Publication not found');

        // @ts-expect-error: err
        publication.ratings.push({userId, rating});
        return await publication.save();
    }

    async searchPublications(query: string) {
        return await Publication.find({
            $or: [
                {name: {$regex: query, $options: 'i'}},
                {subject: {$regex: query, $options: 'i'}},
                {university: {$regex: query, $options: 'i'}}
            ]
        }).populate('author', 'username');
    }
}
