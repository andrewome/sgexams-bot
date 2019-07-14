import { Message, TextChannel, RichEmbed } from 'discord.js';
import log from 'loglevel';
import { MessageCheckerResult } from '../classes/MessageCheckerResult';


export class MessageResponse {
    private message: Message;

    private EMBED_COLOUR = '#ff0000';

    private REPORT = 'Report';

    private CONTEXT = 'Context';

    private WORDS_USED = 'Words Used';

    private MESSAGE_TOO_LONG = '... (message too long)';

    private BAD_WORD_DETECTED = '❌Bad Word Detected❌';

    private CODE_BLOCK = '```\n';

    private FIELD_CHAR_LIMIT = 1024;

    private CONTINUED = 'continued';

    private DOTDOTDOT = '...';

    public constructor(message: Message) {
        this.message = message;
    }

    /**
     * This function generates the response to the results from MessageChecker.
     *
     * @param  {string|undefined} reportingChannelId Channel Id to send report to
     * @returns MessageResponse
     */
    public sendReport(result: MessageCheckerResult,
                      reportingChannelId: string | undefined): MessageResponse {
        // If not set, don't send anything
        if (reportingChannelId === undefined) {
            return this;
        }

        /* eslint-disable no-param-reassign */
        // This function splits up contents and contexts and adds it to the embed.
        const handleContentAndContexts
            = (embed: RichEmbed, content: string, contexts: string): void => {
            // Some strings may be too long. Remove all grave accents and
            // split it up because field can only take in 1024 chars.
            content = content.replace(/```/g, '');
            const contents: string[] = [];
            while (content.length > this.FIELD_CHAR_LIMIT) {
                contents.push(content.substring(0, this.FIELD_CHAR_LIMIT - 12) + this.DOTDOTDOT);
                content = content.substring(this.FIELD_CHAR_LIMIT - 12, content.length);
            }
            contents.push(content.substring(0, content.length));

            if (contexts.length > this.FIELD_CHAR_LIMIT) {
                contexts = contexts.substr(0, 980);
                contexts += this.MESSAGE_TOO_LONG;
            }
            embed.setDescription(`${this.CODE_BLOCK}${contents[0]}${this.CODE_BLOCK}`);

            // Add rest of contents in (if any)
            contents.shift();
            for (const otherContent of contents) {
                embed.addField(this.CONTINUED, `${this.CODE_BLOCK}${otherContent}${this.CODE_BLOCK}`);
            }
        };
        /* eslint-enable no-param-reassign */

        const { tag } = this.message.author;
        const avatarUrl = this.message.author.avatarURL;
        const username = this.message.member.nickname;
        const wordsUsed = result.contexts;
        const { id } = this.message;
        const { url } = this.message;
        const channel = `<#${this.message.channel.id.toString()}>`;
        const { content } = this.message;

        // Generate strings
        let offenderStr = '';
        if (username === null) {
            offenderStr = `${tag}`;
        } else {
            offenderStr = `${username}, aka ${tag}`;
        }
        const report = `**Offender:** ${offenderStr}\n**Message ID:** ${id}\n**Channel:** ${channel}\n**[Message Link](${url})**`;

        // Get list of words used
        let words = '';
        let contexts = '';
        for (const i of wordsUsed) {
            const word = i.bannedWord;
            const context = i.originalContext;
            words += `${word}\n`;
            contexts += `${context}\n`;
        }

        // Make embed
        const embed = new RichEmbed()
            .setColor(this.EMBED_COLOUR)
            .setAuthor(`${offenderStr} said...`, avatarUrl)
            .setTimestamp();

        // Add contents
        handleContentAndContexts(embed, content, contexts);

        // Continue with rest of fields
        embed.addField(this.REPORT, report, false)
            .addField(this.WORDS_USED, `${this.CODE_BLOCK}${words}${this.CODE_BLOCK}`, true)
            .addField(this.CONTEXT, `${this.CODE_BLOCK}${contexts}${this.CODE_BLOCK}`, true);

        const reportingChannel = this.message.guild.channels.get(reportingChannelId)!;
        (reportingChannel as TextChannel).send(this.BAD_WORD_DETECTED, embed);

        // Log it
        log.info(`Bad Word Detected in guild "${this.message.guild.name}". ${offenderStr} said "${content}" which has banned words: ${words.replace(/\n/g, ' ')}`);

        return this;
    }

    /**
     * This function sends a preset message to the offending user.
     *
     * @param  {string|undefined} message Message to send to user
     * @returns MessageResponse
     */
    public sendMessageToUser(message: string | undefined): MessageResponse {
        const { channel } = this.message;
        const user = `<@${this.message.author.id}>`;

        // If message is undefined, don't do anything
        if (message === undefined) return this;

        // Send message
        const replacedMessage = message.replace(/{user}/g, user);
        log.info(`Sending response message - ${replacedMessage}`);
        channel.send(replacedMessage)
            .catch((err): void => {
                if (err.message === 'Missing Permissions') log.warn('Unable to send message. Insufficient permissions.');
            });
        return this;
    }

    /**
     * Deletes the message in question.
     *
     * @param  {boolean} deleteMessage Boolean of delete message option
     * @returns MessageResponse
     */
    public deleteMessage(deleteMessage: boolean): MessageResponse {
        if (!deleteMessage) return this;

        log.info('Deleting message...');
        this.message.delete()
            .catch((err): void => {
                if (err.message === 'Missing Permissions') { log.warn('Unable to delete message. Insufficient permissions.'); }
            });
        return this;
    }
}
