import {
    MessageManager, ChannelLogsQueryOptions, Message, Permissions, TextChannel, Channel,
    MessageEmbed,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class PurgeCommand extends Command {
    private args: string[];

    /** CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false);

    private permissions = new Permissions(['MANAGE_MESSAGES']);

    public static MSG_LIMIT = 5000;

    public static EMBED_TITLE = 'Purge Command';

    public static COMMAND_USAGE = '**Usage:** @bot purge limit [userId]';

    public static ERROR_MESSAGE_INVALID_LIMIT = `Invalid limit. Make sure that that it is below 0 < x <= ${PurgeCommand.MSG_LIMIT}`;

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function deletes messages from the last few messages of the channel
     * The number of messages to check is specified under the limit parameter.
     *
     * @param  {CommandArgs} commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            messageReply, memberPerms, channel, messageId,
        } = commandArgs;
        const messageManager = (channel as TextChannel).messages;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args
        if (this.args.length === 0) {
            messageReply(this.generateInsufficientArgumentsEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const limit = parseInt(this.args[0], 10);
        const userId = this.args.length > 1 ? this.args[1].replace(/[<@!>]/g, '') : null;
        // Check for error on the limit
        if (Number.isNaN(limit) || limit > PurgeCommand.MSG_LIMIT || limit <= 0) {
            messageReply(this.generateInvalidLimitEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Fetch and bulk delete messages
        const sentMessage = await messageReply(this.generateEmbed(`Fetching messages... 0/${limit} messages fetched.`));
        const messages = await this.fetchMessages(messageManager, limit, messageId!, sentMessage);
        const numDeleted = await this.bulkDeleteMessages(userId, messages, channel!, sentMessage);
        sentMessage.edit(this.generateEmbed(`Deleted ${numDeleted} messages.`));

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Bulks deletes an array of messages by splitting it into chunks of 100 as per discord api
     *
     * @param  {string|null} userId Targetted userId
     * @param  {Message[]} collectedMessages collected messages
     * @param  {Channel} channel channel object
     * @returns Promise<number> Number of messages successfully deleted
     */
    private async bulkDeleteMessages(userId: string|null, collectedMessages: Message[],
                                     channel: Channel, sentMessage: Message): Promise<number> {

        sentMessage.edit(this.generateEmbed('Deleting messages...'));

        // Filter messages by userId if specified
        if (userId) {
            // eslint-disable-next-line no-param-reassign
            collectedMessages = collectedMessages.filter((msg) => msg.author.id === userId);
        }

        // Split array into chunks of 100 messages
        const toDelete: Message[][] = [];
        for (let i = 0; i < collectedMessages.length; i += 100) {
            toDelete.push(collectedMessages.slice(i, i + 100));
        }

        // Delete said messages by mapping the functions
        const promises
            = toDelete.map((msgs: Message[]) => (channel as TextChannel).bulkDelete(msgs, true));

        // Get total number of messages deleted
        const deletedMsgs = await Promise.all(promises);
        let num = 0;
        deletedMsgs.forEach((collection) => { num += collection.size; });
        return num;
    }

    /**
     * @param  {MessageManager} messageManager
     * @param  {number} limit Number of messages to fetch
     * @param  {string} messageId MessageId of message to fetch from (not inclusive)
     * @param  {Message} sentMessage Message sent by bot earlier to update on progress
     * @returns Promise<Message[]> Collected messages.
     */
    private async fetchMessages(messageManager: MessageManager, limit: number,
                                messageId: string, sentMessage: Message): Promise<Message[]> {
        let collectedMessages: Message[] = [];
        let lastId = messageId;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const options: ChannelLogsQueryOptions = { limit: 100, before: lastId };

            // eslint-disable-next-line no-await-in-loop
            const messages = await messageManager.fetch(options);
            collectedMessages.push(...messages.array());
            const lastMsg = messages.last();
            if (lastMsg)
                lastId = lastMsg.id;

            // Update message every 200 messages.
            const { length } = collectedMessages;
            if (length && length % 200 === 0)
                sentMessage.edit(this.generateEmbed(
                    `Fetching messages... ${length}/${limit} messages fetched.`,
                ));

            if (messages.size !== 100 || length >= limit) {
                break;
            }
        }

        // If length of messages to be deleted is lesser than LIMIT, slice it to LIMIT size.
        if (collectedMessages.length > limit)
            collectedMessages = collectedMessages.slice(0, limit);

        return collectedMessages;
    }

    private generateInsufficientArgumentsEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            PurgeCommand.EMBED_TITLE,
            `${PurgeCommand.INSUFFICIENT_ARGUMENTS}\n${PurgeCommand.COMMAND_USAGE}`,
            PurgeCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateInvalidLimitEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            PurgeCommand.EMBED_TITLE,
            `${PurgeCommand.ERROR_MESSAGE_INVALID_LIMIT}\n${PurgeCommand.COMMAND_USAGE}`,
            PurgeCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateEmbed(message: string): MessageEmbed {
        return this.generateGenericEmbed(
            PurgeCommand.EMBED_TITLE,
            message,
            PurgeCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
