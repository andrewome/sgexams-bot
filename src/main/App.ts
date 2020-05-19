import './lib/env';
import {
    Client, Message, MessageReaction, User, GuildMemberManager,
} from 'discord.js';
import log, { LoggingMethod } from 'loglevel';
import { Storage } from './storage/Storage';
import { MessageReactionAddEventHandler } from './eventhandler/MessageReactionAddEventHandler';
import { MessageReactionRemoveEventHandler } from './eventhandler/MessageReactionRemoveEventHandler';
import { OnMessageEventHandler } from './eventhandler/OnMessageEventHandler';
import { MessageUpdateEventHandler } from './eventhandler/MessageUpdateEventHandler';
import { StarboardCache } from './storage/StarboardCache';
import { ModDbUtils } from './modules/moderation/ModDbUtils';
import { ModUtils } from './modules/moderation/ModUtil';
import { ModActions } from './modules/moderation/classes/ModActions';

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
        this.bot = new Client({
            restTimeOffset: 0,
            partials: ['MESSAGE', 'REACTION'],
        });
        log.info('Logging the bot in...');
        this.bot.login(process.env.BOT_TOKEN);
        this.storage = new Storage().loadServers();
    }

    /**
     * Contains event emitters that the bot is listening to
     */
    public run(): void {
        this.bot.on(App.MESSAGE, (message: Message): void => {
            new OnMessageEventHandler(this.storage, message, this.bot.user!.id).handleEvent();
        });

        this.bot.on(App.MESSAGE_UPDATE, (oldMessage: Message, newMessage: Message): void => {
            new MessageUpdateEventHandler(this.storage, newMessage).handleEvent();
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bot.on(App.REACTION_ADD, (reaction: MessageReaction, user: User): void => {
            new MessageReactionAddEventHandler(this.storage, reaction).handleEvent();
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bot.on(App.REACTION_REMOVE, (reaction: MessageReaction, user: User): void => {
            new MessageReactionRemoveEventHandler(this.storage, reaction).handleEvent();
        });

        this.bot.on(App.READY, (): void => {
            log.info('Populating Starboard Cache...');
            StarboardCache.generateStarboardMessagesCache(this.bot, this.storage);
            log.info('Handling outstanding timeouts...');
            this.handleTimeouts();
            log.info('I am ready!');
            this.bot.user!.setActivity('with NUKES!!!!', { type: 'PLAYING' });
        });
    }

    /**
     * Handles timeouts in moderationTimeouts table upon booting
     *
     * @returns void
     */
    private handleTimeouts(): void {
        const timeouts = ModDbUtils.fetchActionTimeouts();
        const curTime = ModUtils.getUnixTime();
        timeouts.forEach((timeout) => {
            const {
                serverId, userId, type, endTime,
            } = timeout;
            const guild = this.bot.guilds.resolve(serverId);
            if (!guild) { // Guild can't be found
                // Remove entry if timeout expired
                if (endTime <= curTime)
                    ModDbUtils.removeActionTimeout(userId, type, serverId);
                return;
            }

            const { members } = guild;
            if (endTime > curTime) { // Timer has not expired yet, reset the timeout
                this.handleUnexpiredTimeouts(serverId, userId, type, endTime, curTime, members);
            } else { // Timers have expired
                this.handleExpiredTimeouts(serverId, userId, curTime, type, members);
            }
        });
    }

    /**
     * Handles timeouts that have expired (current time >= end time)
     * Undoes the action and removes the entry.
     *
     * @param  {string} serverId
     * @param  {string} userId
     * @param  {number} curTime
     * @param  {ModActions} type
     * @param  {GuildMemberManager} members
     * @returns void
     */
    private handleExpiredTimeouts(serverId: string, userId: string, curTime: number,
                                  type: ModActions, members: GuildMemberManager): void {
        switch (type) {
            case ModActions.BAN:
                try {
                    ModDbUtils.addModerationAction(
                        serverId, 'AUTO', userId, ModActions.UNBAN, curTime,
                    );
                    ModUtils.handleUnbanTimeout(userId, serverId);
                    members!.unban(userId);
                } catch (err) {
                    log.warn(err);
                }
                break;
            default:
        }
    }

    /**
     * Handles timeouts that have not been expired (current time < end time)
     * Sets a timeout of duration that expires at end time that undoes the action.
     *
     * @param  {string} serverId
     * @param  {string} userId
     * @param  {ModActions} type
     * @param  {number} endTime
     * @param  {number} curTime
     * @param  {GuildMemberManager} members
     * @returns void
     */
    private handleUnexpiredTimeouts(serverId: string, userId: string,
                                    type: ModActions, endTime: number,
                                    curTime: number, members: GuildMemberManager): void {
        const duration = endTime - curTime;
        switch (type) {
            case ModActions.BAN:
                ModUtils.addBanTimeout(duration, endTime, userId, serverId, members);
                break;
            default:
        }
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
