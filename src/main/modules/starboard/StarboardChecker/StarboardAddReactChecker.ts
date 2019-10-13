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
            if (!this.standardChecks()) {
                resolve(null);
                return;
            }

            // Get the count of the number of reactions of starboard emoji.
            const threshold = this.starboardSettings.getThreshold();
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
