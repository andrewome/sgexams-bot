/** Error thrown when DatamuseAPI is unable to fetch */
export class DatamuseQueryError extends Error {
    public constructor(message: string) {
        super(message);
    }
}
