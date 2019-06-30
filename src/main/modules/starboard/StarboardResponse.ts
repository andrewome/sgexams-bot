import { MessageReaction, RichEmbed, TextChannel } from 'discord.js';
import { StarboardSettings } from '../../storage/StarboardSettings';
import { CommandParser } from '../../command/CommandParser';

export class StarboardResponse {
    public static EMBED_COLOUR = 'f6ff73';

    private FIELD_CHAR_LIMIT = 1024;

    private DOTDOTDOT = '...';

    private CONTINUED = 'continued';

    private starboardSettings: StarboardSettings;

    private reaction: MessageReaction;

    public constructor(starboardSettings: StarboardSettings, reaction: MessageReaction) {
        this.starboardSettings = starboardSettings;
        this.reaction = reaction;
    }

    public addToStarboard(): void {
        const starboardChannelId = this.starboardSettings.getChannel()!;
        const emoji = this.starboardSettings.getEmoji()!;
        const { message } = this.reaction;
        const starboardChannel = message.guild.channels.get(starboardChannelId)!;
        const numberOfReacts = this.reaction.count;
        const { tag } = message.author;
        const { nickname } = message.member;
        const channel = `<#${message.channel.id.toString()}>`;
        const { url, id } = message;
        let content = message.cleanContent;

        // Generate strings
        let username = '';
        if (nickname === null) {
            username = `${tag}`;
        } else {
            username = `${nickname}, aka ${tag}`;
        }

        // Message might be too long. Split it up.
        const contents: string[] = [];
        while (content.length > this.FIELD_CHAR_LIMIT) {
            contents.push(content.substring(0, this.FIELD_CHAR_LIMIT - 12) + this.DOTDOTDOT);
            content = content.substring(this.FIELD_CHAR_LIMIT - 12, content.length);
        }
        contents.push(content.substring(0, content.length));

        const embed = new RichEmbed()
            .setColor(StarboardResponse.EMBED_COLOUR)
            .setAuthor(`${username}`, message.author.avatarURL)
            .setDescription(contents[0]);

        // Add rest of contents in (if any)
        contents.shift();
        for (const otherContent of contents) {
            embed.addField(this.CONTINUED, otherContent);
        }

        // Continue with rest of fields
        const details = `**[Message Link](${url})**`;
        embed.addField(CommandParser.EMPTY_STRING, details);

        // Check if image
        if (message.attachments.size > 0) {
            const imageLink = message.attachments.array()[0].url;
            const splittedImageLink = imageLink.split('.');
            const typeOfImage = splittedImageLink[splittedImageLink.length - 1];
            const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
            if (image) {
                embed.setImage(imageLink);
            }
        }
        embed.setTimestamp(message.createdTimestamp);

        const outputMsg = `**${numberOfReacts}** <:${emoji.name}:${emoji.id}>\n**Channel:** ${channel}\n**Message ID:** ${id}`;
        (starboardChannel as TextChannel).send(outputMsg, embed);
    }
}
