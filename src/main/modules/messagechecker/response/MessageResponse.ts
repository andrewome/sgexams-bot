import { Message, TextChannel, MessageEmbed } from 'discord.js';
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
                      reportingChannelId: string | null): MessageResponse {
        // If not set, don't send anything
        if (reportingChannelId === null) {
            return this;
        }

        const { tag } = this.message.author;
        const avatarUrl = this.message.author.avatarURL();
        const username = this.message.member!.nickname;
        const wordsUsed = result.contexts;
        const { id } = this.message;
        const { url } = this.message;
        const channel = `<#${this.message.channel.id}>`;
        const { content } = this.message;

        // Generate strings
        const offender = this.message.author.toString();
        let offenderStr = '';
        if (!username)
            offenderStr = `${tag}`;
        else
            offenderStr = `${username}, aka ${tag}`;
        const report = `**Offender:** ${offender}\n**Message ID:** ${id}\n**Channel:** ${channel}\n**[Message Link](${url})**`;

        // Get list of words used
        let words = '';
        let contexts = '';
        for (const i of wordsUsed) {
            const word = i.bannedWord;
            const context = i.originalContext;
            words += `${word}\n`;
            contexts += `${context}\n`;
        }

        // Reducing length so that it can fit into a embed field
        if (contexts.length > this.FIELD_CHAR_LIMIT) {
            contexts = contexts.substr(0, 980);
            contexts += this.MESSAGE_TOO_LONG;
        }

        // Make embed
        const embed = new MessageEmbed()
            .setColor(this.EMBED_COLOUR)
            .setAuthor(`${offenderStr} said...`, avatarUrl!)
            .setTimestamp();

        // Add contents
        embed.setDescription(content);

        // Continue with rest of fields
        embed.addField(this.REPORT, report, false)
            .addField(this.WORDS_USED, `${this.CODE_BLOCK}${words}${this.CODE_BLOCK}`, true)
            .addField(this.CONTEXT, `${this.CODE_BLOCK}${contexts}${this.CODE_BLOCK}`, true);

        const reportingChannel = this.message.guild!.channels.resolve(reportingChannelId)!;
        (reportingChannel as TextChannel)
            .send(this.BAD_WORD_DETECTED, embed)
            .catch((err) => log.info(`${err}: Unable to send reporting message in ${reportingChannelId}`));

        // Log it
        log.info(`Bad Word Detected in guild "${this.message.guild!.name}". ${offenderStr} said "${content}" which has banned words: ${words.replace(/\n/g, ' ')}`);

        return this;
    }

    /**
     * This function sends a preset message to the offending user.
     *
     * @param  {string|undefined} message Message to send to user
     * @returns MessageResponse
     */
    public sendMessageToUser(message: string | null): MessageResponse {
        const { channel } = this.message;
        const user = `<@${this.message.author.id}>`;

        // If message is null, don't do anything
        if (message === null) return this;

        // Send message
        const replacedMessage = message.replace(/{user}/g, user);
        log.info(`Sending response message - ${replacedMessage}`);
        channel.send(replacedMessage)
            .catch((err) => {
                log.info(`${err}: Unable to send message response.`);
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
                log.info(`${err}: Unable to delete message.`);
            });
        return this;
    }
}
