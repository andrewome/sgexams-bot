import {
    Message, TextChannel, Client, ThreadChannel, DMChannel, MessagePayload, MessageOptions,
} from 'discord.js';
import log from 'loglevel';
import { CommandParser } from '../command/CommandParser';
import { CommandResult } from '../command/classes/CommandResult';
import { Storage } from '../storage/Storage';
import { Server } from '../storage/Server';
import { CommandArgs } from '../command/classes/CommandArgs';
import { MessageEventHandler } from './MessageEventHandler';

/* This class is for the 'message' event */
export class OnMessageEventHandler extends MessageEventHandler {
    private botId: string;

    private emit: Function;

    public constructor(storage: Storage, message: Message, bot: Client) {
        super(storage, message);
        this.botId = bot.user!.id;
        this.emit = bot.emit.bind(bot);
    }

    /**
     * Handles message event
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        try {
            // Handle partial message
            this.message = await this.handlePartial();

            // If it is a DM, ignore.
            if (this.message.channel instanceof DMChannel) return;
            // If it's a bot, ignore :)
            if (this.message!.author!.bot) return;

            const server = this.getServer(this.message!.guild!.id);

            // Handle Command
            const commandResult = await this.handleCommand(server);

            // Check message if command result says so
            if (commandResult.shouldCheckMessage) {
                await this.handleMessageCheck(server);
            }
        } catch (err) {
            this.handleError(err as Error);
        }
    }

    /**
     * Handles commands, if the message contains any
     *
     * @param  {Server} server
     * @returns CommandResult
     */
    private async handleCommand(server: Server): Promise<CommandResult> {
        // Default command result - check messages.
        const defaultCommandResult = new CommandResult(true);

        this.message = await this.handlePartial();

        // If it's a command, execute the command
        this.message = await this.handlePartial();
        const { content } = this.message;
        const commandParser = new CommandParser(content);
        if (commandParser.isCommand(this.botId)) {
            // Get args required for the command
            const memberPerms = this.message.member!.permissions;
            const {
                channels, emojis, members, name, roles,
            } = this.message.guild!;
            const { channel, author } = this.message;
            if (!(channel instanceof TextChannel || channel instanceof ThreadChannel))
                return new CommandResult(false);
            const { tag } = author;
            const { uptime } = this.message.client;
            // if original message is deleted, messageReply will throw 
            // discord API error; simply default to send in the channel
            // await return is needed because for some funny reason the function
            // will throw an error when running in a callback function
            const messageReply = async (options: string | MessagePayload | MessageOptions): Promise<Message> => {
                try {
                    // eslint-disable-next-line no-return-await
                    return await this.message.reply.bind(this.message)(options);
                } catch (err) {
                    // eslint-disable-next-line no-return-await
                    return await this.message.channel.send.bind(this.message.channel)(options);
                }
            };
            const deleteFunction = this.message.delete.bind(this.message);
            const messageId = this.message.id;
            const userId = author.id;
            const { emit, botId } = this;
            const commandArgs: CommandArgs = {
                server, memberPerms, messageReply,
                deleteFunction, uptime, channels,
                emojis, members, channel, userId,
                messageId, emit, botId, roles,
            };

            // Execute command with commandArgs.
            const command = commandParser.getCommand();
            log.info(`${tag} issued command ${command.constructor.name} in ` +
                     `#${(channel as TextChannel).name} of ${name}.\n` +
                     `Message sent: ${content}`);

            return command.execute(commandArgs);
        }

        // Not a command, return default command result
        return defaultCommandResult;
    }
}
