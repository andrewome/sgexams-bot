/** Error thrown when DatamuseAPI is unable to fetch */
export class DatamuseQueryError extends Error {
    constructor(public message: string) {
        super();
    }
}