import './lib/env';
import { Client, Message } from 'discord.js';
import log, { LoggingMethod } from 'loglevel';
import { MessageChecker } from './modules/messagechecker/MessageChecker';
import { MessageResponse } from './modules/messagechecker/response/MessageResponse';
import { CommandParser } from './command/CommandParser';
import { Server } from './storage/Server';
import { Storage } from './storage/Storage';
import { MessageCheckerSettings } from './storage/MessageCheckerSettings';
import { CommandResult } from './command/classes/CommandResult';

// Set up logging method
log.enableAll();
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName): LoggingMethod {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function (message): void {
        const curDate = new Date().toLocaleString();
        const logMsg = `[${curDate}]: ${message}`;
        rawMethod(logMsg);
    };
};
log.setLevel(log.getLevel());

class App {
    private bot: Client;

    private storage: Storage;

    public constructor() {
        this.bot = new Client();
        log.info('Logging the bot in...');
        this.bot.login(process.env.BOT_TOKEN);
        log.info('Loading Servers...');
        this.storage = new Storage().loadServers();
    }

    /**
     * Retrieves server object from server map
     *
     * @param  {string} id Server Id
     * @returns Server
     */
    private getServer(id: string): Server {
        if (this.storage.servers.has(id) === false) {
            this.storage.servers.set(id, new Server(id, new MessageCheckerSettings()));
        }
        return this.storage.servers.get(id)!;
    }

    /**
     * Contains event emitters that the bot is listening to
     */
    public run(): void {
        this.bot.on('message', async (message: Message): Promise<void> => {
            // If it is a DM, ignore.
            if (message.guild === null) return;
            // If it's a bot, ignore :)
            if (message.author.bot) return;

            // Retrieve server
            const server = this.getServer(message.guild.id.toString());
            const bannedWords = server.messageCheckerSettings.getBannedWords();
            const reportingChannelId = server.messageCheckerSettings.getReportingChannelId();
            const responseMessage = server.messageCheckerSettings.getResponseMessage();
            const deleteMessage = server.messageCheckerSettings.getDeleteMessage();

            // If it's a command, execute the command and save servers
            const commandParser = new CommandParser(message.content);
            // Default command result - do not save, check messages.
            let commandResult = new CommandResult(false, true);
            if (commandParser.isCommand(this.bot.user.id.toString())) {
                commandResult = commandParser.getCommand().execute(server, message);
            }

            if (commandResult.shouldSaveServers) this.storage.saveServers();

            // Check message contents if it contains a bad word >:o
            if (commandResult.shouldCheckMessage) {
                try {
                    this.checkMessage(message,
                                      bannedWords,
                                      reportingChannelId,
                                      responseMessage,
                                      deleteMessage);
                } catch (err) {
                    log.error(err);
                }
            }
        });

        this.bot.on('messageUpdate', async (oldMessage, newMessage): Promise<void> => {
            // If it is a DM, ignore.
            if (newMessage.guild === null) return;
            // If it's a bot, ignore :)
            if (newMessage.author.bot) return;

            // Retrieve server
            const server = this.getServer(newMessage.guild.id.toString());
            const bannedWords = server.messageCheckerSettings.getBannedWords();
            const reportingChannelId = server.messageCheckerSettings.getReportingChannelId();
            const responseMessage = server.messageCheckerSettings.getResponseMessage();
            const deleteMessage = server.messageCheckerSettings.getDeleteMessage();

            // Check message contents if it contains a bad word >:o
            try {
                this.checkMessage(newMessage,
                                  bannedWords,
                                  reportingChannelId,
                                  responseMessage,
                                  deleteMessage);
            } catch (err) {
                log.error(err);
            }
        });

        this.bot.on('ready', (): void => {
            log.info('I am ready!');
            this.bot.user.setActivity('with NUKES!!!!', { type: 'PLAYING' });
        });
    }

    /* eslint-disable class-methods-use-this */
    private async checkMessage(message: Message,
                               bannedWords: string[],
                               reportingChannelId: string | undefined,
                               responseMessage: string | undefined,
                               deleteMessage: boolean): Promise<void> {
        const result = await new MessageChecker().checkMessage(message.content, bannedWords);
        if (result.guilty) {
            new MessageResponse(message)
                .sendReport(result, reportingChannelId)
                .sendMessageToUser(responseMessage)
                .deleteMessage(deleteMessage);
        }
    }
    /* eslint-enable class-methods-use-this */
}

new App().run();
