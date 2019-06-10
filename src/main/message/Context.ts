/** This class represents the context of a banned word found in the message. */
export class Context {
    public bannedWord: string;
    public originalContext: string;
    public convertedContext: string;

    constructor(bannedWord: string, originalContext: string, convertedContext: string ) {
        this.bannedWord = bannedWord;
        this.originalContext = originalContext;
        this.convertedContext = convertedContext;
    }

    public equals(other: Context) {
        if(other.bannedWord === this.bannedWord &&
           other.originalContext === this.originalContext &&
           other.convertedContext === this.convertedContext) {
               return true;
           }
        return false;
    }
}