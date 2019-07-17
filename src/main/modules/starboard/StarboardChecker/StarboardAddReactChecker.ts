import { StarboardChecker } from './StarboardChecker';

export class StarboardAddReactChecker extends StarboardChecker {
    /**
     * This function checks if the reaction qualifies for
     * making changes to the Starboard.
     *
     * @returns Promise<number | null> Null if no changes or number of reacts.
     */
    public async checkAddReact(): Promise<number | null> {
        return new Promise<number | null>((resolve): void => {
            const starboardEmoji = this.starboardSettings.getEmoji();
            const threshold = this.starboardSettings.getThreshold();
            const channel = this.starboardSettings.getChannel();

            if (!this.standardChecks(starboardEmoji, threshold, channel)) {
                resolve(null);
                return;
            }

            // Get the count of the number of reactions of starboard emoji.
            this.getNumberOfReactions().then((size: number): void => {
                if (size < threshold!) {
                    resolve(null);
                } else {
                    resolve(size);
                }
            });
        });
    }
}
