import { StarboardChecker } from './StarboardChecker';

export class StarboardRemoveReactChecker extends StarboardChecker {
    /**
     * This function checks if the reaction qualifies for
     * making changes to the Starboard.
     *
     * @returns Promise<[number, string] | null> null if checks fail,
     * or tuple of #of reacts + starboard channel id
     */
    public async checkRemoveReact(): Promise<[number, string] | null> {
        return new Promise<[number, string] | null>((resolve): void => {
            const starboardEmoji = this.starboardSettings.getEmoji();
            const threshold = this.starboardSettings.getThreshold();
            const channel = this.starboardSettings.getChannel();

            if (!this.standardChecks(starboardEmoji, threshold, channel)) {
                resolve(null);
                return;
            }

            // Check if id of message appears in the Starboard
            // If exists, definitely need to update (delete or edit)
            const starboardChannelId = this.checkIfMessageExists();
            if (starboardChannelId !== null) {
               // Get the count of the number of
               // reactions of starboard emoji.
                this.getNumberOfReactions()
                    .then((size: number): void => {
                        resolve([size, starboardChannelId]);
                    });
            } else {
                resolve(null);
            }
        });
    }
}
