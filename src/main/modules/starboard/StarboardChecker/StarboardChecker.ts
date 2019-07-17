import {
 MessageReaction, User, Collection,
} from 'discord.js';
import { StarboardSettings, SimplifiedEmoji } from '../../../storage/StarboardSettings';
import { StarboardCache } from '../../../storage/StarboardCache';

export abstract class StarboardChecker {
    protected starboardSettings: StarboardSettings;

    protected reaction: MessageReaction;

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
     * @returns string, starboard message id
     */
    public checkIfMessageExists(): string | null {
        const { starboardMessageCache } = StarboardCache;
        const { message } = this.reaction;
        const guildId = message.guild.id;

        if (!starboardMessageCache.has(guildId)) {
            return null;
        }

        const serverCache = starboardMessageCache.get(guildId)!;
        if (!serverCache.messageExists(message.id)) {
            return null;
        }

        const starboardMessageId = serverCache.getStarboardMessageId(message.id);
        if (starboardMessageId === null) {
            return null;
        }

        return starboardMessageId;
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
