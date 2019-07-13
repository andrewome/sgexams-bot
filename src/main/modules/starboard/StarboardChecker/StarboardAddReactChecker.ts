import { StarboardChecker } from './StarboardChecker';

export class StarboardAddReactChecker extends StarboardChecker {
    /**
     * This function checks if the reaction qualifies for
     * making changes to the Starboard.
     *
     * @returns Promise<boolean>
     */
    public async checkAddReact(): Promise<boolean> {
        return new Promise<boolean>((resolve): void => {
            const starboardEmoji = this.starboardSettings.getEmoji();
            const threshold = this.starboardSettings.getThreshold();
            const channel = this.starboardSettings.getChannel();

            if (!this.standardChecks(starboardEmoji, threshold, channel)) {
                resolve(false);
                return;
            }

            // Get the count of the number of reactions of starboard emoji.
            this.getNumberOfReactions().then((size: number): void => {
                if (size < threshold!) {
                    resolve(false);
                } else {
                    this.numberOfReactions = size;
                    resolve(true);
                }
            });
        });
    }
}
