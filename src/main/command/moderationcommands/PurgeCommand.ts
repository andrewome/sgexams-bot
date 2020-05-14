import {
    MessageManager, ChannelLogsQueryOptions, Message, Permissions, TextChannel,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class PurgeCommand extends Command {
    private args: string[];

    /** CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false);

    private permissions = new Permissions(['MANAGE_MESSAGES']);

    private MSG_LIMIT = 5000;

    private COMMAND_USAGE = '**Usage:** @bot purge limit [userId]';

    private ERROR_MESSAGE_INVALID_LIMIT = `Invalid limit. Make sure that that it is below 0 < x <= ${this.MSG_LIMIT}.\n${this.COMMAND_USAGE}`;

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
    public execute(commandArgs: CommandArgs): CommandResult {
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
            messageReply(`${PurgeCommand.NO_ARGUMENTS}\n${this.COMMAND_USAGE}`);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const limit = parseInt(this.args[0], 10);
        const userId = this.args.length > 1 ? this.args[1] : null;
        // Check for error on the limit
        if (Number.isNaN(limit) || limit > this.MSG_LIMIT || limit <= 0) {
            messageReply(this.ERROR_MESSAGE_INVALID_LIMIT);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Bulk delete messages
        this.fetchMessages(messageManager, limit, messageId!).then(async (messages: Message[]) => {
            if (userId) {
                // eslint-disable-next-line no-param-reassign
                messages = messages.filter((msg) => msg.author.id === userId);
            }

            const deletedMessages = await (channel as TextChannel).bulkDelete(messages, true);
            messageReply(`Deleted ${deletedMessages.size} messages.`);
        });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This function fetches the last x messages from a channel
     *
     * @param  {MessageManager} messageManager
     * @param  {number} limit Number of messages to fetch
     * @param  {string} messageId Message Id of command, to prevent deletion
     * @returns Promise
     */
    private async fetchMessages(messageManager: MessageManager, limit: number,
                                messageId: string): Promise<Message[]> {
        const collectedMessages: Message[] = [];
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

            if (messages.size !== 100 || collectedMessages.length >= limit) {
                break;
            }
        }

        // If length of messages to be deleted is lesser than LIMIT, slice it to LIMIT size.
        if (collectedMessages.length > limit)
            return collectedMessages.slice(0, limit);

        return collectedMessages;
    }
}
