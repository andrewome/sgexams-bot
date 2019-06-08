/** This class contains the return results from MessageChecker */
export class MessageCheckerResult {
    /** Boolean value if message is guilty of using banned words */
    public guilty: boolean;
    /** Array of banned words used */
    public bannedWordsUsed: [string, string][];

    constructor(guilty: boolean, bannedWordsUsed: [string, string][]) {
        this.guilty = guilty;
        this.bannedWordsUsed = bannedWordsUsed;
    }
}