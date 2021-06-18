import { Message, PartialMessage } from 'discord.js';
import { EventHandler } from './EventHandler';
import { Storage } from '../storage/Storage';
import { Server } from '../storage/Server';
import { MessageChecker } from '../modules/messagechecker/MessageChecker';
import { MessageResponse } from '../modules/messagechecker/response/MessageResponse';

/* This class is the base class for message events. */
export abstract class MessageEventHandler extends EventHandler {
    protected message: Message | PartialMessage;

    public constructor(storage: Storage, message: Message | PartialMessage) {
        super(storage);
        this.message = message;
    }

    /**
     * Handles fetching of message if it's partial.
     *
     * @returns Promise<Message>
     */
    protected async handlePartial(): Promise<Message> {
        if (this.message.partial) {
            this.message = await this.message.fetch();
        }
        return this.message;
    }

    /**
     * Handles Message Check
     *
     * @param  {Server} server
     * @returns Promise
     */
    protected async handleMessageCheck(server: Server): Promise<void> {
        this.message = await this.handlePartial();

        // Retrieve settings
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        const reportingChannelId = server.messageCheckerSettings.getReportingChannelId();
        const responseMessage = server.messageCheckerSettings.getResponseMessage();
        const deleteMessage = server.messageCheckerSettings.getDeleteMessage();

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
