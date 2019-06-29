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

    public constructor(message: Message) {
        this.message = message;
    }

    /**
     * This function generates the response to the results from MessageChecker.
     *
     * @param  {string|undefined} reportingChannelId Channel Id to send report to
     * @returns MessageResponse
     */
    public sendReport(result: MessageCheckerResult, reportingChannelId: string | undefined): MessageResponse {
        // If not set, don't send anything
        if (reportingChannelId === undefined) {
            return this;
        }

        const { tag } = this.message.author;
        const avatarUrl = this.message.author.avatarURL;
        const username = this.message.member.nickname;
        const wordsUsed = result.contexts;
        const { id } = this.message;
        const { url } = this.message;
        const channel = `<#${this.message.channel.id.toString()}>`;
        let { content } = this.message;

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

        // Some strings may be too long, stop it at 1024 chars.
        if (content.length > 1024) {
            content = content.substr(0, 980);
            content += this.MESSAGE_TOO_LONG;
        }

        if (contexts.length > 1024) {
            contexts = contexts.substr(0, 980);
            contexts += this.MESSAGE_TOO_LONG;
        }

        // Make embed
        const embed = new RichEmbed()
            .setColor(this.EMBED_COLOUR)
            .setAuthor(`${offenderStr} said...`, avatarUrl)
            .setDescription(`${this.CODE_BLOCK}${content}${this.CODE_BLOCK}`)
            .addField(this.REPORT, report, false)
            .addField(this.WORDS_USED, `${this.CODE_BLOCK}${words}${this.CODE_BLOCK}`, true)
            .addField(this.CONTEXT, `${this.CODE_BLOCK}${contexts}${this.CODE_BLOCK}`, true)
            .setTimestamp();

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
        message = message.replace(/{user}/g, user);
        log.info(`Sending response message - ${message}`);
        channel.send(message)
            .catch((err) => {
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
            .catch((err) => {
                if (err.message === 'Missing Permissions') log.warn('Unable to delete message. Insufficient permissions.');
            });
        return this;
    }
}
