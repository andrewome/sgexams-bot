import { StarboardChecker } from './StarboardChecker';

export class StarboardAddReactChecker extends StarboardChecker {
    /** 7 days */
    private MAX_TIME_DIFFERENCE = 1000 * 60 * 60 * 24 * 7;

    /**
     * This method checks if the time difference between current time
     * and the created time of the message.
     *
     * @returns boolean true if smaller, false if larger.
     */
    public checkTimeDifference(): boolean {
        const createdTime = this.reaction.message.createdAt;
        const currentTime = new Date();
        return (currentTime.getTime() - createdTime.getTime()) <= this.MAX_TIME_DIFFERENCE;
    }

    /**
     * This function checks if the reaction qualifies for
     * making changes to the Starboard.
     *
     * @returns Promise<number | null> Null if no changes or number of reacts.
     */
    public async checkAddReact(): Promise<number | null> {
        if (!this.standardChecks()) {
            return null;
        }

        // Get the count of the number of reactions of starboard emoji.
        const threshold = this.starboardSettings.getThreshold();
        const size = await this.getNumberOfReactions();

        if (size < threshold!)
            return null;

        return size;
    }
}
