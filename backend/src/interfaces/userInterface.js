export interface IUserDTO {
    username: string;
    email: string;
    password: string;
    university: string;
}

export interface IUserResponse {
    id: string;
    username: string;
    email: string;
    university: string;
}

export interface ILoginDTO {
    username: string;
    password: string;
}

export interface ILoginResponse {
    token: string;
    user: IUserResponse;
}

export interface IUserRepository {
    create(user: IUserDTO): Promise<IUserResponse>;

    findById(id: string): Promise<IUserResponse | null>;

    findByUsername(username: string): Promise<IUserResponse | null>;

    findByEmail(email: string): Promise<IUserResponse | null>;

    update(id: string, user: Partial<IUserDTO>): Promise<IUserResponse | null>;

    delete(id: string): Promise<boolean>;

    findAll(): Promise<IUserResponse[]>;

    validateCredentials(username: string, password: string): Promise<IUserResponse | null>;
}