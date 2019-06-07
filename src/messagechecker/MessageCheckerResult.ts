/** This class contains the return results from MessageChecker */
export class MessageCheckerResult {
    /** Boolean value if message is guilty of using banned words */
    public guilty: boolean;
    /** Array of banned words used */
    public bannedWordsUsed: string[];
    /** Content of the message */
    public content: string;

    constructor(guilty: boolean, bannedWordsUsed: string[], content: string) {
        this.guilty = guilty;
        this.bannedWordsUsed = bannedWordsUsed;
        this.content = content;
    }
}