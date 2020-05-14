import {
    MessageReaction, TextChannel,
} from 'discord.js';
import { StarboardSettings } from '../../../storage/StarboardSettings';
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
     * @param  {SimplifiedEmoji[]} starboardEmojis
     * @param  {number|null} threshold
     * @param  {string|null} channel
     * @returns boolean false if failed, true if passed
     */
    protected standardChecks(): boolean {
        const starboardEmojis = this.starboardSettings.getEmoji();
        const threshold = this.starboardSettings.getThreshold();
        const channel = this.starboardSettings.getChannel();

        // If any of the settings are null, starboard cannot work
        if (starboardEmojis.length === 0 || threshold === null || channel === null) {
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

        // If the ID of the emoji being reacted is not the starboard emojis, ignore
        if (!this.starboardSettings.hasEmojiById(this.reaction.emoji.id)) {
            return false;
        }

        return true;
    }

    /**
     * This function checks if the message being reacted exists inside
     * the Starboard channel already.
     *
     * @returns boolean
     */
    public checkIfMessageExists(): boolean {
        const { starboardMessageCache } = StarboardCache;
        const msgId = this.reaction.message.id;
        const guildId = this.reaction.message.guild!.id;

        if (!starboardMessageCache.has(guildId)) {
            return false;
        }

        const serverCache = starboardMessageCache.get(guildId)!;
        if (!serverCache.messageExists(msgId)) {
            return false;
        }

        return true;
    }

    /**
     * This function returns the starboard msg id of a starboarded mesg
     * Returns null if message does not exist on the starboard channel.
     *
     * @returns string
     */
    public fetchStarboardId(): string | null {
        if (!this.checkIfMessageExists()) return null;

        const { starboardMessageCache } = StarboardCache;
        const msgId = this.reaction.message.id;
        const guildId = this.reaction.message.guild!.id;

        const serverCache = starboardMessageCache.get(guildId)!;
        const starboardMessageId = serverCache.getStarboardMessageId(msgId);

        return starboardMessageId;
    }

    /**
     * Compares the emoji in the starboard channel with the emoji in the react.
     * Returns true if the same, else returns false.
     *
     * @param  {string} messageId
     * @returns Promise<boolean>
     */
    public async checkEmojiInStarboardMessage(messageId: string): Promise<boolean> {
        // Get channel, then message
        const starboardChannel = this.reaction.message.guild!.channels.resolve(
                this.starboardSettings.getChannel()!,
        );
        const message = await (starboardChannel as TextChannel).messages.fetch(messageId);

        // Check if emoji that's on the starboard is the same as the reaction
        const content = message.content.split(' ');
        const regexEmote = new RegExp('<a?:(.+):(\\d+)>', 'g');
        const match = regexEmote.exec(content[1])!;
        const name = match[1];
        const id = match[2];

        if (name === this.reaction.emoji.name && id === this.reaction.emoji.id)
            return true;

        return false;
    }

    /**
     * Fetches the number of reactions on a MessageReaction object
     * because the built in one on Discord.js relies on cache.
     *
     * @returns Promise
     */
    protected async getNumberOfReactions(): Promise<number> {
        const { size } = await this.reaction.users.fetch();
        return size;
    }
}
