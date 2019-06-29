import { Context } from './Context';

/** This class contains the return results from MessageChecker */
export class MessageCheckerResult {
    /** Boolean value if message is guilty of using banned words */
    public guilty: boolean;

    /** Array of banned words used */
    public contexts: Context[];

    constructor(guilty: boolean, contexts: Context[]) {
        this.guilty = guilty;
        this.contexts = contexts;
    }
}
