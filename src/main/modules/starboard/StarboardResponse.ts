import {
    MessageReaction, TextChannel, MessageAttachment, MessageEmbed, Collection,
} from 'discord.js';
import { StarboardSettings } from '../../storage/StarboardSettings';

export class StarboardResponse {
    public static EMBED_COLOUR = 0xf6ff73;

    private starboardSettings: StarboardSettings;

    private reaction: MessageReaction;

    public constructor(starboardSettings: StarboardSettings, reaction: MessageReaction) {
        this.starboardSettings = starboardSettings;
        this.reaction = reaction;
    }

    /**
     * Adds a message with enough reactions to the starboard.
     *
     * @param  {number} numberOfReacts Number of reacts.
     * @returns Promise
     */
    public async addToStarboard(numberOfReacts: number): Promise<void> {
        // This function handles attaching of images to the embed
        const handleAttachmentAndEmbeds
            = (embed: MessageEmbed,
               embeds: MessageEmbed[],
               attachments: Collection <string, MessageAttachment>): void => {

                // Check embeds for image
                if (embeds.length > 0) {
                    const msgEmbed = embeds[0];
                    const { thumbnail } = msgEmbed;

                    // We're using thumbnail url here because instagram and imgur.
                    // Still works though!
                    if (msgEmbed.type === 'image' && thumbnail) {
                        embed.setImage(thumbnail.url);
                    }
                }

                // Check attachments
                // setImage is overriden if img because attachment takes presidence.
                if (attachments.size > 0) {
                    const file = attachments.at(0);
                    const { url, name } = file!;
                    const splittedFileUrl = url.split('.');
                    const typeOfImage = splittedFileUrl[splittedFileUrl.length - 1];
                    const image = /(jpg|jpeg|png|gif|webp)/gi.test(typeOfImage);
                    if (image) {
                        embed.setImage(url);
                    } else {
                        // It is an attachment that is not an image, send as attachment.
                        embed.addField('Attachment', `[${name}](${url})`, false);
                    }
                }
            };

        const starboardChannelId = this.starboardSettings.getChannel()!;
        const { emoji } = this.reaction;
        const { message } = this.reaction;
        const starboardChannel = message.guild!.channels.resolve(starboardChannelId)!;
        const { tag } = message.author!;
        const channel = `<#${message.channel.id}>`;
        const {
            url, id, attachments, embeds,
        } = message;
        const { content, member } = message; // null if member has left the guild.
        let nickname = null;
        // assign nickname if member is not null
        if (member)
            nickname = member.nickname;

        // Generate embed
        let username = '';
        if (!nickname)
            username = `${tag}`;
        else
            username = `${nickname}, aka ${tag}`;

        const embed = new MessageEmbed()
            .setColor(StarboardResponse.EMBED_COLOUR)
            .setAuthor(`${username}`, message.author!.avatarURL()!)
            .setTimestamp(message.createdTimestamp)
            .setDescription(content!);

        // Handle attachments and embeds in message
        handleAttachmentAndEmbeds(embed, embeds, attachments);

        // Continue with rest of fields
        const details = `**[Message Link](${url})**`;
        embed.addField('Original', details);

        const outputMsg
            = `**${numberOfReacts}** <:${emoji.name}:${emoji.id}> **In:** ${channel} **ID:** ${id}`;
        await (starboardChannel as TextChannel).send({ content: outputMsg, embeds: [embed] });
    }

    /**
     * Edits the starboard message count with the new number of reacts.
     *
     * @param  {number} numberOfReacts
     * @param  {string} messageId
     * @returns Promise
     */
    public async editStarboardMessageCount(numberOfReacts: number,
                                           messageId: string): Promise<void> {
        // Get channel
        const starboardChannel = this.reaction.message.guild!.channels.resolve(
            this.starboardSettings.getChannel()!,
        );

        // Get message
        const message = await (starboardChannel as TextChannel).messages.fetch(messageId);

        // Set and edit replacement value
        let replacementValue: number;
        if (Number.isNaN(numberOfReacts)) {
            replacementValue = 0;
        } else {
            replacementValue = numberOfReacts;
        }
        const content = message.content.split(' ');
        content[0] = `**${replacementValue}**`;

        // Stitch back new content.
        let newContent = '';
        for (const str of content) {
            newContent += str;
            newContent += ' ';
        }
        await message.edit({ content: newContent, embeds: [message.embeds[0]] });
    }

    /**
     * Deletes message from starboard channel
     *
     * @param  {string} messageId
     * @returns Promise
     */
    public async deleteStarboardMessage(messageId: string): Promise<void> {
        // Get channel, then message
        const starboardChannel = this.reaction.message.guild!.channels.resolve(
                this.starboardSettings.getChannel()!,
        );

        const message = await (starboardChannel as TextChannel).messages.fetch(messageId);
        await message.delete();
    }
}
