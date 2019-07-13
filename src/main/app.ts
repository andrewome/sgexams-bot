import './lib/env';
import {
 Client, Message, MessageReaction, User,
} from 'discord.js';
import log, { LoggingMethod } from 'loglevel';
import { Storage } from './storage/Storage';
import { RawEventHandler } from './eventhandler/RawEventHandler';
import { MessageReactionAddEventHandler } from './eventhandler/MessageReactionAddEventHandler';
import { MessageReactionRemoveEventHandler } from './eventhandler/MessageReactionRemoveEventHandler';
import { MessageEventHandler } from './eventhandler/MessageEventHandler';
import { MessageUpdateEventHandler } from './eventhandler/MessageUpdateEventHandler';

class App {
    private bot: Client;

    private storage: Storage;

    private MESSAGE = MessageEventHandler.EVENT_NAME;

    private MESSAGE_UPDATE = MessageUpdateEventHandler.EVENT_NAME;

    private REACTION_ADD = MessageReactionAddEventHandler.EVENT_NAME;

    private REACTION_REMOVE = MessageReactionRemoveEventHandler.EVENT_NAME;

    private RAW = RawEventHandler.EVENT_NAME;

    public constructor() {
        this.bot = new Client();
        log.info('Logging the bot in...');
        this.bot.login(process.env.BOT_TOKEN);
        log.info('Loading Servers...');
        this.storage = new Storage().loadServers();
    }

    /**
     * Contains event emitters that the bot is listening to
     */
    public run(): void {
        this.bot.on(this.MESSAGE, (message: Message): void => {
            new MessageEventHandler(message, this.storage, this.bot.user.id).handleEvent();
        });

        this.bot.on(this.MESSAGE_UPDATE, (oldMessage: Message,
                                          newMessage: Message): void => {
            new MessageUpdateEventHandler(this.storage, newMessage).handleEvent();
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.bot.on(this.RAW, (packet: any): void => {
            new RawEventHandler(this.storage, this.bot, packet).handleEvent();
        });

        /* eslint-disable @typescript-eslint/no-unused-vars */
        this.bot.on(this.REACTION_ADD, (reaction: MessageReaction,
                                        user: User): void => {
            new MessageReactionAddEventHandler(this.storage, reaction).handleEvent();
        });

        this.bot.on(this.REACTION_REMOVE, (reaction: MessageReaction,
                                           user: User): void => {
            new MessageReactionRemoveEventHandler(this.storage, reaction).handleEvent();
        });
        /* eslint-enable @typescript-eslint/no-unused-vars */

        this.bot.on('ready', (): void => {
            log.info('I am ready!');
            this.bot.user.setActivity('with NUKES!!!!', { type: 'PLAYING' });
        });
    }
}

// Set up logging method
log.enableAll();
const originalFactory = log.methodFactory;

// Make logs show current date
const newMethodFactory = (methodName: string,
                          logLevel: 0 | 1 | 2 | 3 | 4 | 5,
                          loggerName: string): LoggingMethod => {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);
    const editedMethodFactory = (message: string): void => {
        const curDate = new Date().toLocaleString();
        const logMsg = `[${curDate}]: ${message}`;
        rawMethod(logMsg);
    };

    return editedMethodFactory;
};
log.methodFactory = newMethodFactory;

log.setLevel(log.getLevel());

new App().run();
