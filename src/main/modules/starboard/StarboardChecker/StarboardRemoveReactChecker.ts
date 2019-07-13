import { Collection, User } from 'discord.js';
import { StarboardChecker } from './StarboardChecker';

export class StarboardRemoveReactChecker extends StarboardChecker {
    /**
     * This function checks if the reaction qualifies for
     * making changes to the Starboard.
     *
     * @returns Promise<boolean>
     */
    public async checkRemoveReact(): Promise<boolean> {
        return new Promise<boolean>((resolve): void => {
            const starboardEmoji = this.starboardSettings.getEmoji();
            const threshold = this.starboardSettings.getThreshold();
            const channel = this.starboardSettings.getChannel();

            if (!this.standardChecks(starboardEmoji, threshold, channel)) {
                resolve(false);
                return;
            }

            // Check if id of message appears in the Starboard
            // If exists, definitely need to update (delete or edit)
            this.checkIfMessageExists()
                .then((exists: boolean): void => {
                    if (exists) {
                        // Get the count of the number of
                        // reactions of starboard emoji.
                        this.getNumberOfReactions()
                            .then((size: number): void => {
                                this.numberOfReactions = size;
                                resolve(true);
                            });
                    } else {
                        resolve(false);
                    }
                });
        });
    }

    /**
     * This function checks if the starboard post should be deleted.
     *
     * @returns Promise true if delete, false if edit.
     */
    public async shouldDeleteMessage(): Promise<boolean> {
        return new Promise<boolean>((resolve): void => {
            const threshold = this.starboardSettings.getThreshold();

            // Get the count of the number of reactions of starboard emoji.
            this.reaction.fetchUsers()
                .then((users: Collection<string, User>): void => {
                    const { size } = users;
                    // If smaller, should remove
                    if (size < threshold!) {
                        resolve(true);
                    } else {
                        this.numberOfReactions = size;
                        resolve(false);
                    }
                });
        });
    }
}
