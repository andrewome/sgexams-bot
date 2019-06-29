export class NoSuchCommandError 
    extends Error {
    public constructor(message: string) {
        super(message);
    }
}
