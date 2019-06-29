export class NoSuchCommandError extends Error {
    constructor(public message: string) {
        super();
    }
}
