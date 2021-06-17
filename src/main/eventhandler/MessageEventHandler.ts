import { Message } from 'discord.js';
import { EventHandler } from './EventHandler';
import { Storage } from '../storage/Storage';
import { Server } from '../storage/Server';
import { MessageChecker } from '../modules/messagechecker/MessageChecker';
import { MessageResponse } from '../modules/messagechecker/response/MessageResponse';

/* This class is the base class for message events. */
export abstract class MessageEventHandler extends EventHandler {
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
    protected async handlePartial(): Promise<void> {
        if (this.message.partial) {
            await this.message.fetch();
        }
    }

    /**
     * Handles Message Check
     *
     * @param  {Server} server
     * @returns Promise
     */
    protected async handleMessageCheck(server: Server): Promise<void> {
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
        
        if(this.message.content.toLowerCase().includes("math")){
            new MessageResponse(this.message).sendMessageToUser("<@!223340518619217920> <@!426743679055822857>");
        }
    }
}
