import {
    MessageReaction, TextChannel,
} from 'discord.js';
import { StarboardSettings } from '../../../storage/StarboardSettings';

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
        if (this.reaction.message.author!.bot) {
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
     * the Starboard channel already. Returns msgId if exists, else null
     *
     * @returns Promise <string | boolean>
     */
    public async checkIfMessageExists(): Promise<string | null> {
        const msgId = this.reaction.message.id;
        const guild = this.reaction.message.guild!;

        const starboardId = this.starboardSettings.getChannel();
        if (starboardId === null)
            return null;

        const channel = guild.channels.resolve(starboardId!);
        if (!channel)
            return null;

        const messages = await (channel as TextChannel).messages.fetch({ limit: 100 });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, message] of messages) {
            // Assuming each post content is structured like this:
            // eslint-disable-next-line max-len
            // `**${numberOfReacts}** <:${emoji.name}:${emoji.id}> **Channel:** ${channel} **ID:** ${id}`;
            const id = message.content.split(' ')[5];
            if (id === msgId)
                return message.id;
        }
        return null;
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
        if (!match) {
            const { id } = this.reaction.message.guild!;
            throw new Error(
                `Starboard format not adhered to! Server: ${id}, ` +
                `Channel: ${starboardChannel!.id}, Message: ${messageId}`,
            );
        }

        const { 1: name, 2: id } = match;
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
