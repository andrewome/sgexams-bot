import { Context } from './Context';

/** This class contains the return results from MessageChecker */
export interface MessageCheckerResult {
    /** Boolean value if message is guilty of using banned words */
    guilty: boolean;

    /** Array of banned words used */
    contexts: Context[];
}
