import { Message } from 'discord.js';
import { EventHandler } from './EventHandler';
import { Storage } from '../storage/Storage';
import { MessageChecker } from '../modules/messagechecker/MessageChecker';
import { MessageResponse } from '../modules/messagechecker/response/MessageResponse';

export class MessageUpdateEventHandler extends EventHandler {
    protected message: Message;

    public constructor(storage: Storage, message: Message) {
        super(storage);
        this.message = message;
    }

    /**
     * Handles fetching of message if it's partial.
     *
     * @returns Promise<void>
     */
    public async handlePartial(): Promise<void> {
        if (this.message.partial) {
            await this.message.fetch();
        }
    }

    /**
     * Handles when message is editted
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        // Handle partial message
        await this.handlePartial();
        // If it is a DM, ignore.
        if (this.message.guild === null) return;
        // If it's a bot, ignore :)
        if (this.message.author.bot) return;

        const server = this.getServer(this.message.guild.id.toString());

        // Retrieve settings
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        const reportingChannelId = server.messageCheckerSettings.getReportingChannelId();
        const responseMessage = server.messageCheckerSettings.getResponseMessage();
        const deleteMessage = server.messageCheckerSettings.getDeleteMessage();

        // Check updated message
        const result
            = await new MessageChecker().checkMessage(this.message.content, bannedWords);
        if (result.guilty) {
            new MessageResponse(this.message)
                .sendReport(result, reportingChannelId)
                .sendMessageToUser(responseMessage)
                .deleteMessage(deleteMessage);
        }
    }
}
