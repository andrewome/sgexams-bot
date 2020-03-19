import './lib/env';
import {
    Client, Message, MessageReaction, User,
} from 'discord.js';
import log, { LoggingMethod } from 'loglevel';
import { Storage } from './storage/Storage';
// import { RawEventHandler } from './eventhandler/RawEventHandler';
import { MessageReactionAddEventHandler } from './eventhandler/MessageReactionAddEventHandler';
import { MessageReactionRemoveEventHandler } from './eventhandler/MessageReactionRemoveEventHandler';
import { MessageEventHandler } from './eventhandler/MessageEventHandler';
import { MessageUpdateEventHandler } from './eventhandler/MessageUpdateEventHandler';
import { StarboardCache } from './storage/StarboardCache';

export class App {
    private bot: Client;

    private storage: Storage;

    public static readonly MESSAGE = 'message';

    public static readonly MESSAGE_UPDATE = 'messageUpdate';

    public static readonly REACTION_ADD = 'messageReactionAdd';

    public static readonly REACTION_REMOVE = 'messageReactionRemove';

    public static readonly REACTION_DELETED = 'messageReactionDeleted';

    public static readonly RAW = 'raw';

    public static readonly READY = 'ready';

    public constructor() {
        // set restTimeOffset to 0ms, original 500ms.
        this.bot = new Client({ restTimeOffset: 0 });
        log.info('Logging the bot in...');
        this.bot.login(process.env.BOT_TOKEN);
        this.storage = new Storage().loadServers();
    }

    /**
     * Contains event emitters that the bot is listening to
     */
    public run(): void {
        this.bot.on(App.MESSAGE, (message: Message): void => {
            new MessageEventHandler(message, this.storage, this.bot.user!.id).handleEvent();
        });

        this.bot.on(App.MESSAGE_UPDATE, (oldMessage: Message, newMessage: Message): void => {
            new MessageUpdateEventHandler(this.storage, newMessage).handleEvent();
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // this.bot.on(App.RAW, (packet: any): void => {
        //     new RawEventHandler(this.storage, this.bot, packet).handleEvent();
        // });

        /* eslint-disable @typescript-eslint/no-unused-vars */
        this.bot.on(App.REACTION_ADD, (reaction: MessageReaction, user: User): void => {
            new MessageReactionAddEventHandler(this.storage, reaction).handleEvent();
        });

        this.bot.on(App.REACTION_REMOVE, (reaction: MessageReaction, user: User): void => {
            new MessageReactionRemoveEventHandler(this.storage, reaction).handleEvent();
        });
        /* eslint-enable @typescript-eslint/no-unused-vars */

        this.bot.on(App.READY, (): void => {
            log.info('Populating Starboard Cache...');
            StarboardCache.generateStarboardMessagesCache(this.bot, this.storage);
            log.info('I am ready!');
            this.bot.user!.setActivity('with NUKES!!!!', { type: 'PLAYING' });
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
