import {
 MessageReaction, Message, User, Collection, TextChannel,
} from 'discord.js';
import { StarboardSettings, SimplifiedEmoji } from '../../../storage/StarboardSettings';

export class StarboardChecker {
    protected starboardSettings: StarboardSettings;

    protected reaction: MessageReaction;

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
    protected standardChecks(starboardEmoji: SimplifiedEmoji | null,
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

        // If the ID of the emoji being reacted is not the starboard emoji, ignore
        if (this.reaction.emoji.id !== starboardEmoji!.id) {
            return false;
        }

        return true;
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
     * Fetches the number of reactions on a MessageReaction object
     * because the built in one on Discord.js relies on cache.
     *
     * @returns Promise
     */
    protected async getNumberOfReactions(): Promise<number> {
        return new Promise<number>((resolve): void => {
            this.reaction.fetchUsers()
                .then((users: Collection<string, User>): void => {
                    const { size } = users;
                    resolve(size);
                });
        });
    }
}
