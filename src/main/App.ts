import './lib/env';
import {
    Client, Message, MessageReaction, User, GuildMemberManager, MessageEmbed, TextChannel,
} from 'discord.js';
import log, { LoggingMethod } from 'loglevel';
import { SqliteError } from 'better-sqlite3';
import { Storage } from './storage/Storage';
import { MessageReactionAddEventHandler } from './eventhandler/MessageReactionAddEventHandler';
import { MessageReactionRemoveEventHandler } from './eventhandler/MessageReactionRemoveEventHandler';
import { OnMessageEventHandler } from './eventhandler/OnMessageEventHandler';
import { MessageUpdateEventHandler } from './eventhandler/MessageUpdateEventHandler';
import { StarboardCache } from './storage/StarboardCache';
import { ModDbUtils } from './modules/moderation/ModDbUtils';
import { ModUtils } from './modules/moderation/ModUtil';
import { ModActions } from './modules/moderation/classes/ModActions';
import { Command } from './command/Command';

export class App {
    private bot: Client;

    private storage: Storage;

    public static readonly MESSAGE = 'message';

    public static readonly MESSAGE_UPDATE = 'messageUpdate';

    public static readonly REACTION_ADD = 'messageReactionAdd';

    public static readonly REACTION_REMOVE = 'messageReactionRemove';

    public static readonly REACTION_DELETED = 'messageReactionDeleted';

    public static readonly MODLOG_UPDATE = 'modLogUpdate';

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
            new OnMessageEventHandler(this.storage, message, this.bot)
                .handleEvent()
                .catch((err) => {
                    this.handleError(err);
                });
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        this.bot.on(App.MODLOG_UPDATE, (serverId: string, caseId: number,
                                        modId: string, userId: string,
                                        type: ModActions, reason: string|null,
                                        timeout: number|null, timestamp: number): void => {
            this.handleModLogUpdate(
                serverId, caseId, modId, userId, type, reason, timeout, timestamp,
            ).catch((err) => {
                this.handleError(err);
            });
        });

        this.bot.on(App.READY, (): void => {
            try {
                log.info('Populating Starboard Cache...');
                StarboardCache.generateStarboardMessagesCache(this.bot, this.storage);
                log.info('Handling outstanding timeouts...');
                this.handleTimeouts();
                log.info('I am ready!');
                this.bot.user!.setActivity('with NUKES!!!!', { type: 'PLAYING' });
            } catch (err) {
                this.handleError(err);
            }
        });
    }

    /**
     * Warn error. If sqlite error shut bot down.
     *
     * @param  {Error} err
     * @returns void
     */
    private handleError(err: Error): void {
        log.warn(err.stack);
        if (err instanceof SqliteError) {
            log.error('Sqlite Error detected. Shutting down.');
            process.exit();
        }
    }

    /**
     * Handles ModLog update event by creating appropriate embed and sending in designated channel.
     *
     * @param  {string} serverId
     * @param  {number} caseId
     * @param  {string} modId
     * @param  {string} userId
     * @param  {ModActions} type
     * @param  {string|null} reason
     * @param  {number|null} timeout
     * @param  {number} timestamp
     * @returns Promise
     */
    private async handleModLogUpdate(serverId: string, caseId: number,
                                     modId: string, userId: string,
                                     type: ModActions, reason: string|null,
                                     timeout: number|null, timestamp: number): Promise<void> {
        // Get channel
        const channelId = ModDbUtils.getModLogChannel(serverId);
        if (!channelId)
            return;
        const channel = this.bot.channels.resolve(channelId);
        if (!channel || channel.type !== 'text')
            return;
        const embed = new MessageEmbed();
        embed.addField('Moderator', `<@${modId}>`, true);
        // Delete warn is a bit different
        if (type !== ModActions.UNWARN) {
            const user = await this.bot.users.fetch(userId);
            embed.setTitle(`Case ${caseId}: ${user.tag} (${userId})`);
            embed.addField('User', `<@${userId}>`, true);
        } else {
            embed.setTitle(`Case ${caseId}: Remove Warn`);
            embed.addField('Case ID', `${userId}`, true);
        }
        embed.addField('\u200b', '\u200b', true);
        embed.addField('Type', type, true);
        embed.addField('Reason', reason || '-', true);
        if (type === ModActions.MUTE || type === ModActions.BAN) {
            const timeoutStr = timeout ? `${Math.floor((timeout / 60))} minutes` : 'Permanent';
            embed.addField('Length', timeoutStr, true);
        }
        embed.setTimestamp(timestamp * 1000);
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        (channel as TextChannel).send(embed);
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
        const emit = this.bot.emit.bind(this.bot);
        const botId = this.bot.user!.id;
        switch (type) {
            case ModActions.BAN:
                ModDbUtils.addModerationAction(
                    serverId, botId, userId, ModActions.UNBAN, curTime, emit, 'Expired timeout on boot',
                );
                ModUtils.handleUnbanTimeout(userId, serverId);
                members!.unban(userId)
                    .catch((err) => {
                        log.info(err);
                        log.info(
                            `Unable to unban user ${userId} from server ${serverId}.` +
                            'Check the server ban list for confirmation.',
                        );
                    });
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
        const emit = this.bot.emit.bind(this.bot);
        const botId = this.bot.user!.id;
        const duration = endTime - curTime;
        switch (type) {
            case ModActions.BAN:
                ModUtils.addBanTimeout(duration, endTime, userId, serverId, botId, members, emit);
                break;
            default:
        }
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
            const curDate = new Date().toLocaleString();
            const logMsg = `[${curDate}]: ${message}`;
            rawMethod(logMsg);
        };

        return editedMethodFactory;
    };
    log.methodFactory = newMethodFactory;

    log.setLevel(log.getLevel());

    try {
        new App().run();
    } catch (err) {
        log.warn(err.stack);
        if (err instanceof SqliteError) {
            log.error('Sqlite Error detected. Shutting down.');
            process.exit();
        }
    }
}
