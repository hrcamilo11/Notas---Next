export interface IPublicationDTO {
    name: string;
    subject: string;
    university: string;
    author: string;
    file?: {
        filename: string;
        contentType: string;
        length: number;
        uploadDate: Date;
    };
    featured?: boolean;
}

export interface IRatingDTO {
    userId: string;
    rating: number;
}

export interface IPublicationResponse {
    id: string;
    name: string;
    subject: string;
    university: string;
    author: {
        id: string;
        username: string;
    };
    file?: {
        filename: string;
        contentType: string;
        length: number;
        uploadDate: Date;
    };
    featured: boolean;
    downloadCount: number;
    ratings: IRatingDTO[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IPublicationRepository {
    create(publication: IPublicationDTO): Promise<IPublicationResponse>;

    findById(id: string): Promise<IPublicationResponse | null>;

    findByAuthor(authorId: string): Promise<IPublicationResponse[]>;

    update(id: string, publication: Partial<IPublicationDTO>): Promise<IPublicationResponse | null>;

    delete(id: string): Promise<boolean>;

    findAll(): Promise<IPublicationResponse[]>;

    addRating(id: string, rating: IRatingDTO): Promise<IPublicationResponse | null>;

    incrementDownloadCount(id: string): Promise<IPublicationResponse | null>;

    findFeatured(): Promise<IPublicationResponse[]>;

    search(query: string): Promise<IPublicationResponse[]>;
}