import { MessageEventHandler } from './MessageEventHandler';

export class MessageUpdateEventHandler extends MessageEventHandler {
    /**
     * Handles when message is edited
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        // Handle partial message
        await this.handlePartial();
        // If it is a DM, ignore.
        if (this.message.guild === null) return;
        // If it's a bot, ignore :)
        // author can be null for some reason
        if (this.message.author && this.message.author.bot) return;

        // Check updated message
        const server = this.getServer(this.message.guild.id.toString());
        this.handleMessageCheck(server);
    }
}
