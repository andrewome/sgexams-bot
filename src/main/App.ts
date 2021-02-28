import './lib/env';
import {
    Client, Message, MessageReaction, User, GuildMember, PartialMessage, PartialUser,
} from 'discord.js';
import log, { LoggingMethod } from 'loglevel';
import { SqliteError } from 'better-sqlite3';
import { Storage } from './storage/Storage';
import { MessageReactionAddEventHandler } from './eventhandler/MessageReactionAddEventHandler';
import { MessageReactionRemoveEventHandler } from './eventhandler/MessageReactionRemoveEventHandler';
import { OnMessageEventHandler } from './eventhandler/OnMessageEventHandler';
import { MessageUpdateEventHandler } from './eventhandler/MessageUpdateEventHandler';
import { ReadyEventHandler } from './eventhandler/ReadyEventHandler';
import { ModLogUpdateEventHandler } from './eventhandler/ModLogUpdateEventHandler';
import { ModLog } from './modules/moderation/classes/ModLog';
import { UserJoinEventHandler } from './eventhandler/UserJoinEventHandler';

export class App {
    private bot: Client;

    private storage: Storage = new Storage();

    public static readonly MESSAGE = 'message';

    public static readonly MESSAGE_UPDATE = 'messageUpdate';

    public static readonly REACTION_ADD = 'messageReactionAdd';

    public static readonly REACTION_REMOVE = 'messageReactionRemove';

    public static readonly REACTION_DELETED = 'messageReactionDeleted';

    public static readonly MODLOG_UPDATE = 'modLogUpdate';

    public static readonly USER_JOIN = 'guildMemberAdd';

    public static readonly READY = 'ready';

    public constructor() {
        // set restTimeOffset to 0ms, original 500ms.
        this.bot = new Client({
            restTimeOffset: 0,
            partials: ['MESSAGE', 'REACTION'],
        });
    }

    /**
     * This function initialises the app by logging the bot in and filling up the storage.
     *
     * @returns App
     */
    public async initialise(): Promise<App> {
        log.info('Logging the bot in...');
        await this.bot.login(process.env.BOT_TOKEN)
            .catch(() => {
                log.error('Unable to login. Shutting down.');
                process.exit();
            });
        try {
            this.storage = new Storage().loadServers();
        } catch (err) {
            log.warn(err.stack);
            if (err instanceof SqliteError) {
                log.error('Sqlite Error detected. Shutting down.');
                process.exit();
            }
        }
        return this;
    }

    /**
     * Contains event emitters that the bot is listening to
     */
    public run(): void {
        this.bot.on(App.READY, (): void => {
            new ReadyEventHandler(this.bot, this.storage).handleEvent();
        });

        this.bot.on(App.MESSAGE, (message: Message): void => {
            new OnMessageEventHandler(this.storage, message, this.bot).handleEvent();
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bot.on(App.MESSAGE_UPDATE, async (_: Message | PartialMessage, newMessage: Message | PartialMessage): Promise<void> => {
            if (newMessage.partial) {
                newMessage = await newMessage.fetch();
            }
            new MessageUpdateEventHandler(this.storage, newMessage).handleEvent();
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bot.on(App.REACTION_ADD, (reaction: MessageReaction, _: User | PartialUser): void => {
            new MessageReactionAddEventHandler(this.storage, reaction).handleEvent();
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bot.on(App.REACTION_REMOVE, (reaction: MessageReaction, _: User | PartialUser): void => {
            new MessageReactionRemoveEventHandler(this.storage, reaction).handleEvent();
        });

        this.bot.on(App.USER_JOIN, (member: GuildMember): void => {
            new UserJoinEventHandler(this.storage, member).handleEvent();
        });

        this.bot.on(App.MODLOG_UPDATE, (modLog: ModLog): void => {
            new ModLogUpdateEventHandler(this.storage, this.bot, modLog).handleEvent();
        });
    }
}

if (require.main === module) {
    // Set up logging method
    log.enableAll();
    const originalFactory = log.methodFactory;

    // Make logs show current date
    const newMethodFactory = (methodName: string,
                              logLevel: 0 | 1 | 2 | 3 | 4 | 5,
                              loggerName: string): LoggingMethod => {
        const rawMethod = originalFactory(methodName, logLevel, loggerName);
        const editedMethodFactory = (message: string): void => {
            const curDate = new Date().toLocaleString('en-SG');
            const logMsg = `[${curDate}]: ${message}`;
            rawMethod(logMsg);
        };

        return editedMethodFactory;
    };
    log.methodFactory = newMethodFactory;
    log.setLevel(log.getLevel());

    // Start bot
    new App().initialise().then((app) => app.run());
}
