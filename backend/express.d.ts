// eslint-disable-next-line @typescript-eslint/no-unused-vars

declare global {
    namespace Express {
        interface Request {
            user?: { id: string }; // Define la estructura que necesitas
        }
    }
}
