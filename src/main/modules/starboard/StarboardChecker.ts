import {
 MessageReaction, Message, User, Collection, TextChannel,
} from 'discord.js';
import { StarboardSettings, SimplifiedEmoji } from '../../storage/StarboardSettings';

export class StarboardChecker {
    private starboardSettings: StarboardSettings;

    private reaction: MessageReaction;

    public numberOfReactions: number = NaN;

    public messageIdInStarboardChannel: string | null = null;

    public constructor(starboardSettings: StarboardSettings,
                       reaction: MessageReaction) {
        this.starboardSettings = starboardSettings;
        this.reaction = reaction;
    }

    /**
     * Standard checks.
     *
     * @param  {Emoji|null} starboardEmoji
     * @param  {number|null} threshold
     * @param  {string|null} channel
     * @returns boolean false if failed, true if passed
     */
    private standardChecks(starboardEmoji: SimplifiedEmoji | null,
                           threshold: number | null,
                           channel: string | null): boolean {
        // If any of the settings are null, starboard cannot work
        if (starboardEmoji === null || threshold === null || channel === null) {
            return false;
        }

        // Check if message is not sent in the starboard channel.
        if (this.reaction.message.id === channel) {
            return false;
        }

        // Check if message author is not a bot.
        if (this.reaction.message.author.bot) {
            return false;
        }

        // Make sure emoji sent is a custom emoji.
        // Sorry, normal emojis not supported :c
        if (this.reaction.emoji.id === null) {
            return false;
        }

        return true;
    }

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

            // If the ID of the emoji being reacted is not the starboard emoji, ignore
            if (this.reaction.emoji.id !== starboardEmoji!.id) {
                resolve(false);
                return;
            }

            // Get the count of the number of reactions of starboard emoji.
            this.reaction.fetchUsers()
                .then((users: Collection<string, User>): void => {
                    const { size } = users;
                    if (size < threshold!) {
                        resolve(false);
                        return;
                    }
                    this.numberOfReactions = size;
                    resolve(true);
                });
        });
    }

    /**
     * This function checks if the message being reacted exists inside
     * the Starboard channel already.
     *
     * @returns Promise
     */
    public async checkIfMessageExists(): Promise<boolean> {
        return new Promise<boolean>((resolve): void => {
            const messageId = this.reaction.message.id;

            const starboardId = this.starboardSettings.getChannel();
            if (starboardId === null) {
                resolve(false);
            }

            // Get messages from starboard channel
            const channel = this.reaction.message.guild.channels.get(starboardId!);
            (channel as TextChannel).fetchMessages({ limit: 100 })
                .then((messages: Collection<string, Message>): void => {
                    const msgArr = messages.array();
                    for (const message of msgArr) {
                        // Assuming each post content is structured like this:
                        // eslint-disable-next-line max-len
                        // `**${numberOfReacts}** <:${emoji.name}:${emoji.id}> **Channel:** ${channel} **ID:** ${id}`;
                        const id = message.content.split(' ')[5];
                        if (id === messageId) {
                            this.messageIdInStarboardChannel = message.id;
                            resolve(true);
                            return;
                        }
                    }
                    resolve(false);
                });
        });
    }

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
                        resolve(true);
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
