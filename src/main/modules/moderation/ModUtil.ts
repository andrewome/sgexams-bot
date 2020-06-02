import { GuildMemberManager } from 'discord.js';
import log from 'loglevel';
import { ModActions } from './classes/ModActions';
import { ModDbUtils } from './ModDbUtils';

export class ModUtils {
    public static readonly MINUTES_IN_SECONDS = 60;

    public static readonly HOURS_IN_SECONDS = ModUtils.MINUTES_IN_SECONDS * 60;

    public static readonly DAYS_IN_SECONDS = ModUtils.HOURS_IN_SECONDS * 24;

    public static readonly timers: Map<number, NodeJS.Timer> = new Map();

    /**
     * Parses a string in the form X{m|h|d} where X is an integer greater than 0.
     * Returns null if string is malformed, else number of seconds
     *
     * @param  {string}
     * @returns number
     */
    public static parseDuration(str: string): number | null {
        const { MINUTES_IN_SECONDS, HOURS_IN_SECONDS, DAYS_IN_SECONDS } = ModUtils;
        const m: Map<string, number>
            = new Map([['m', MINUTES_IN_SECONDS], ['h', HOURS_IN_SECONDS], ['d', DAYS_IN_SECONDS]]);

        if (!str)
            return null;

        str = str.toLowerCase();
        const match = /(\d+)(m|h|d)/g.exec(str);
        if (match) {
            // Get index 1 and 2 of the match arr
            const { 1: duration, 2: type } = match;
            if (Number.parseInt(duration, 10) < 1)
                return null;
            return Number.parseInt(duration, 10) * m.get(type)!;
        }

        return null;
    }

    /**
     * Returns # of seconds since unix epoch
     *
     * @returns number
     */
    public static getUnixTime(): number {
        return Math.floor(Date.now() / 1000);
    }


    /**
     * Assigns a random ID to a timeout stored in timers map
     *
     * @param  {NodeJS.Timer} timer
     * @returns number ID mapped to that timer
     */
    private static assignTimeout(timer: NodeJS.Timer): number {
        // Generates an integer from 1 to 2^31 - 1
        const genRandom = (): number => Math.floor(Math.random() * (2 ** 31 - 2)) + 1;
        const { timers } = ModUtils;
        let rand = genRandom();
        while (timers.has(rand))
            rand = genRandom();

        timers.set(rand, timer);
        return rand;
    }

    /**
     * Deletes entry from the timers map and clears the timeout if exists
     *
     * @param  {number} timerId
     * @returns void
     */
    private static removeTimeout(timerId: number): void {
        const { timers } = ModUtils;
        if (timers.has(timerId)) {
            log.info(`Removing timerId: ${timerId}`);
            clearTimeout(timers.get(timerId)!);
            timers.delete(timerId);
        }
    }

    /**
     * This function adds the ban timeout to the database and calls setBanTimeout
     *
     * @param  {number} duration
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {string} botId
     * @param  {GuildMemberManager} guildMemberManager
     * @param  {Function} emit
     * @returns void
     */
    public static addBanTimeout(duration: number, endTime: number, userId: string, serverId: string,
                                botId: string, guildMemberManager: GuildMemberManager,
                                emit: Function): void {
        const timer =
            ModUtils.setBanTimeout(duration, userId, serverId, botId, guildMemberManager, emit);

        const timerId = ModUtils.assignTimeout(timer);

        ModDbUtils.addActionTimeout(
            endTime, userId, ModActions.BAN, serverId, timerId,
        );
    }

    /**
     * This function handles the timeout of the ban to unban the user when timeout is up.
     *
     * @param  {number} duration
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {string} botId
     * @param  {GuildMemberManager} guildMemberManager
     * @param  {Function} emit
     * @returns NodeJS.Timer
     */
    public static setBanTimeout(duration: number, userId: string, serverId: string,
                                botId: string, guildMemberManager: GuildMemberManager,
                                emit: Function): NodeJS.Timer {
        const callback = (): void => {
            const durationInMinutes = Math.floor(duration / 60);
            log.info(`Unbanning ${userId} after ${durationInMinutes} minutes timeout.`);
            // Unban member
            guildMemberManager.unban(userId)
                .catch((err) => {
                    log.info(err);
                    log.info(`Unable to unban user ${userId} from server ${serverId}.`);
                });

            // Remove entry from db
            const timerId = ModDbUtils.removeActionTimeout(userId, ModActions.BAN, serverId);

            // Remove timer from timers map
            ModUtils.removeTimeout(timerId);

            // Add unban entry to db
            const reason = `Unban after ${Math.floor(duration / 60)} minutes.`;
            ModDbUtils.addModerationAction(
                serverId, botId, userId, ModActions.UNBAN, ModUtils.getUnixTime(), emit, reason,
            );
            log.info(`Done removing ${userId} from Database.`);
        };

        return setTimeout(callback, duration * 1000);
    }

    /**
     * Removes ban timeout if exists
     *
     * @param  {string} userId
     * @param  {string} serverId
     * @returns void
     */
    public static handleUnbanTimeout(userId: string, serverId: string): void {
        const timerId = ModDbUtils.removeActionTimeout(userId, ModActions.BAN, serverId);
        if (timerId) {
            ModUtils.removeTimeout(timerId);
        }
    }

    /**
     * This function adds the ban timeout to the database and calls setBanTimeout
     *
     * @param  {number} duration
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {string} botId
     * @param  {GuildMemberManager} guildMemberManager
     * @param  {Function} emit
     * @param  {muteroleId} muteroleId
     * @returns void
     */
    // eslint-disable-next-line max-len
    public static addMuteTimeout(duration: number, endTime: number, userId: string, serverId: string,
                                 botId: string, guildMemberManager: GuildMemberManager,
                                 emit: Function, muteRoleId: string): void {
        const timer = ModUtils.setMuteTimeout(
            duration, userId, serverId, botId, guildMemberManager, emit, muteRoleId,
        );

        const timerId = ModUtils.assignTimeout(timer);

        ModDbUtils.addActionTimeout(
            endTime, userId, ModActions.MUTE, serverId, timerId,
        );
    }

    /**
     * This function handles the timeout of the ban to unban the user when timeout is up.
     *
     * @param  {number} duration
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {string} botId
     * @param  {GuildMemberManager} guildMemberManager
     * @param  {Function} emit
     * @param  {muteroleId} muteroleId
     * @returns NodeJS.Timer
     */
    public static setMuteTimeout(duration: number, userId: string, serverId: string,
                                 botId: string, guildMemberManager: GuildMemberManager,
                                 emit: Function, muteRoleId: string): NodeJS.Timer {
        const callback = (): void => {
            const durationInMinutes = Math.floor(duration / 60);
            log.info(`Unmuting ${userId} after ${durationInMinutes} minutes timeout.`);
            // Unmute member
            guildMemberManager.fetch(userId)
                .then((guildMember) => guildMember.roles.remove(muteRoleId))
                .catch((err) => {
                    log.info(err);
                    log.info(`Unable to unmute user ${userId} from server ${serverId}. Mute role is ${muteRoleId}`);
                });

            // Remove entry from db
            const timerId = ModDbUtils.removeActionTimeout(userId, ModActions.MUTE, serverId);

            // Remove timer from timers map
            ModUtils.removeTimeout(timerId);

            // Add unmute entry to db
            const reason = `Unmute after ${Math.floor(duration / 60)} minutes.`;
            ModDbUtils.addModerationAction(
                serverId, botId, userId, ModActions.UNMUTE, ModUtils.getUnixTime(), emit, reason,
            );
            log.info(`Done removing ${userId} from Database.`);
        };

        return setTimeout(callback, duration * 1000);
    }

    /**
     * Removes timeout if exists
     *
     * @param  {string} userId
     * @param  {string} serverId
     * @returns void
     */
    public static handleUnmuteTimeout(userId: string, serverId: string): void {
        const timerId = ModDbUtils.removeActionTimeout(userId, ModActions.MUTE, serverId);
        if (timerId) {
            ModUtils.removeTimeout(timerId);
        }
    }
}
