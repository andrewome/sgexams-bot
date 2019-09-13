import { Message, Emoji, Channel } from 'discord.js';
import { CommandParser } from '../command/CommandParser';
import { CommandResult } from '../command/classes/CommandResult';
import { Storage } from '../storage/Storage';
import { Server } from '../storage/Server';
import { MessageChecker } from '../modules/messagechecker/MessageChecker';
import { MessageResponse } from '../modules/messagechecker/response/MessageResponse';
import { EventHandler } from './EventHandler';
import { CommandParams, CommandType } from '../command/classes/CommandParams';
import { RotateImageCommandData } from '../command/misccommands/rotateimagecommands/RotateImageCommandData';
import { CollectionWrapper } from '../command/classes/CollectionWrapper';
import { UptimeCheckCommandData } from '../command/misccommands/statuscheckcommands/UptimeCheckCommandData';

export class MessageEventHandler extends EventHandler {
    public static EVENT_NAME = 'message';

    private message: Message;

    private botId: string;

    public constructor(message: Message,
                       storage: Storage,
                       botId: string) {
        super(storage);
        this.message = message;
        this.botId = botId;
    }

    /**
     * Handles message event
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        // If it is a DM, ignore.
        if (this.message.guild === null) return;
        // If it's a bot, ignore :)
        if (this.message.author.bot) return;

        const server = this.getServer(this.message.guild.id.toString());

        // Handle Command
        const commandResult = this.handleCommand(server);

        // Save servers if commands has changed anything
        if (commandResult.shouldSaveServers) this.storage.saveServers();

        // Check message if command result says so
        if (commandResult.shouldCheckMessage) {
            this.handleMessageCheck(server);
        }
    }

    /**
     * Handles Message Check
     *
     * @param  {Server} server
     * @returns Promise
     */
    private async handleMessageCheck(server: Server): Promise<void> {
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

    /**
     * Handles commands, if the message contains any
     *
     * @param  {Server} server
     * @returns CommandResult
     */
    private handleCommand(server: Server): CommandResult {
        // Default command result - do not save, check messages.
        const defaultCommandResult = new CommandResult(false, true);

        // If it's a command, execute the command
        const commandParser = new CommandParser(this.message.content);
        if (commandParser.isCommand(this.botId)) {
            const { permissions } = this.message.member;

            const sendFunction = this.message.channel.send.bind(this.message.channel);
            const command = commandParser.getCommand();
            const commandType = command.constructor.name;

            // Execute the correct execute function based on the command object returned.
            switch (CommandParams.checkCommandType(commandType)) {
                case CommandType.requiresDefault: {
                    return command.execute(server, permissions, sendFunction);
                }
                case CommandType.requiresChannels: {
                    const { channels } = this.message.guild;
                    return command.execute(server, permissions, sendFunction, channels as CollectionWrapper<string, Channel>);
                }
                case CommandType.requiresEmojis: {
                    const { emojis } = this.message.guild;
                    return command.execute(server, permissions, sendFunction, emojis as CollectionWrapper<string, Emoji>);
                }
                case CommandType.requiresRotateImageData: {
                    const { channel, author } = this.message;
                    const { id } = author;
                    const data = new RotateImageCommandData(channel, id);
                    return command.execute(server, permissions, sendFunction, data);
                }
                case CommandType.requiresUptimeCheckData: {
                    const { uptime } = this.message.client;
                    const data = new UptimeCheckCommandData(uptime);
                    return command.execute(server, permissions, sendFunction, data);
                }
            }
        }
        
        // Not a command, return default command result
        return defaultCommandResult;
    }
}
