import { Message, TextChannel } from 'discord.js';
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

    public constructor(storage: Storage,
                       message: Message,
                       botId: string) {
        super(storage, message);
        this.botId = botId;
    }

    /**
     * Handles message event
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

        // Handle Command
        const commandResult = this.handleCommand(server);

        // Check message if command result says so
        if (commandResult.shouldCheckMessage) {
            this.handleMessageCheck(server);
        }
    }

    /**
     * Handles commands, if the message contains any
     *
     * @param  {Server} server
     * @returns CommandResult
     */
    private handleCommand(server: Server): CommandResult {
        // Default command result - check messages.
        const defaultCommandResult = new CommandResult(true);

        // If it's a command, execute the command
        const { content } = this.message;
        const commandParser = new CommandParser(content);
        if (commandParser.isCommand(this.botId)) {
            // Get args required for the command
            const { permissions } = this.message.member!;
            const { channels, emojis, name } = this.message.guild!;
            const { channel, author } = this.message;
            const { id, tag } = author;
            const { uptime } = this.message.client;
            const sendFunction = this.message.channel.send.bind(this.message.channel);
            const deleteFunction = this.message.delete.bind(this.message);
            const commandArgs = new CommandArgs(
                server, permissions,
                sendFunction, uptime!,
                channels, emojis,
                channel, id, deleteFunction,
            );

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
