import { GuildMemberManager } from 'discord.js';
import log from 'loglevel';
import { DatabaseConnection } from '../../DatabaseConnection';
import { ModActions } from './ModActions';

export class ModUtils {
    public static readonly MINUTES_IN_SECONDS = 60;

    public static readonly HOURS_IN_SECONDS = ModUtils.MINUTES_IN_SECONDS * 60;

    public static readonly DAYS_IN_SECONDS = ModUtils.HOURS_IN_SECONDS * 24;

    public static readonly timers: Map<number, NodeJS.Timer> = new Map();

    /**
     * Parses a string in the form X{m|h|d} where X is an integer.
     * Returns null if string is malformed, else number of seconds
     *
     * @param  {string}
     * @returns number
     */
    public static parseDuration(str: string): number | null {
        const { MINUTES_IN_SECONDS, HOURS_IN_SECONDS, DAYS_IN_SECONDS } = ModUtils;
        const m: Map<string, number>
            = new Map([['m', MINUTES_IN_SECONDS], ['h', HOURS_IN_SECONDS], ['d', DAYS_IN_SECONDS]]);
        str = str.toLowerCase();

        const match = /(\d+)(m|h|d)/g.exec(str);
        if (match) {
            // Get index 1 and 2 of the match arr
            const { 1: duration, 2: type } = match;
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
     * Returns the latest case number from mod log table
     *
     * @returns number
     */
    public static getLastestCaseId(): number {
        const db = DatabaseConnection.connect();
        const res = db.prepare('SELECT caseId FROM moderationLogs ORDER BY caseId DESC').get();
        db.close();
        return res ? res.caseId : 0;
    }

    /**
     * Assigns a random ID to a timeout stored in timers map
     *
     * @param  {NodeJS.Timer} timer
     * @returns number ID mapped to that timer
     */
    private static assignTimeout(timer: NodeJS.Timer): number {
        const genRandom = (): number => Math.floor(Math.random() * (2 ** 31 - 1));
        let rand = genRandom();
        while (ModUtils.timers.has(rand))
            rand = genRandom();

        ModUtils.timers.set(rand, timer);
        return rand;
    }

    /**
     * Deletes an entry from the timers map if exists
     *
     * @param  {number} timerId
     * @returns void
     */
    private static removeTimeout(timerId: number): void {
        if (ModUtils.timers.has(timerId))
            ModUtils.timers.delete(timerId);
    }

    /**
     * Adds an action with a timeout into the timeout database
     *
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {ModActions} type
     * @param  {string} serverId
     */
    private static addActionTimeout(endTime: number, userId: string, type: ModActions,
                                    serverId: string, timerId: number): void {
        const db = DatabaseConnection.connect();
        db.prepare(
            'INSERT INTO moderationTimeouts (serverId, userId, type, endTime, timerId) VALUES (?, ?, ?, ?, ?)',
        ).run(serverId, userId, type, endTime, timerId);
        db.close();
    }

    /**
     * Remove an entry from the timeout database
     *
     * @param  {string} userId
     * @param  {ModActions} type
     * @param  {string} serverId
     * @returns number timerId
     */
    private static removeActionTimeout(userId: string, type: ModActions,
                                       serverId: string): number {
        const db = DatabaseConnection.connect();

        // Get the timerId
        const { timerId } = db.prepare(
            'SELECT timerId FROM moderationTimeouts WHERE serverId = ? AND userId = ? AND type = ?',
        ).get(serverId, userId, type);

        // Delete row
        db.prepare(
            'DELETE FROM moderationTimeouts WHERE serverId = ? AND userId = ? AND type = ?',
        ).run(serverId, userId, type);

        db.close();

        return timerId;
    }

    /**
     * This function adds the ban timeout to the database and calls setBanTimeout
     *
     * @param  {number} duration
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {GuildMemberManager} guildMemberManager
     * @returns void
     */
    public static addBanTimeout(duration: number, endTime: number, userId: string,
                                serverId: string, guildMemberManager: GuildMemberManager): void {
        const timer =
            ModUtils.setBanTimeout(duration, userId, serverId, guildMemberManager);

        const timerId = ModUtils.assignTimeout(timer);

        ModUtils.addActionTimeout(
            endTime, userId, ModActions.BAN, serverId, timerId,
        );
    }

    /**
     * This function handles the timeout of the ban to unban the user when timeout is up.
     *
     * @param  {number} duration
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {GuildMemberManager} guildMemberManager
     * @returns NodeJS.Timer
     */
    public static setBanTimeout(duration: number, userId: string, serverId: string,
                                guildMemberManager: GuildMemberManager): NodeJS.Timer {
        const callback = (): void => {
            log.info(`Unbanning ${userId} after ${duration}s timeout.`);
            // Unban member
            guildMemberManager.unban(userId);

            // Remove entry from db
            const timerId = ModUtils.removeActionTimeout(userId, ModActions.BAN, serverId);

            // Remove timer from timers map
            ModUtils.removeTimeout(timerId);

            // Add unban entry to db
            ModUtils.addModerationAction(serverId, 'AUTO', userId, ModActions.UNBAN, ModUtils.getUnixTime());
            log.info(`Sucessfully unbanned ${userId}.`);
        };

        return setTimeout(callback, duration * 1000);
    }

    /**
     * Adds the mod action into the database
     *
     * @param  {string} serverId
     * @param  {string} modId
     * @param  {string} userId
     * @param  {ModActions} type
     * @param  {number} timestamp
     * @param  {string} reason?
     * @param  {number} timeout?
     * @returns void
     */
    public static addModerationAction(serverId: string, modId: string, userId: string,
                                      type: ModActions, timestamp: number, reason?: string,
                                      timeout?: number|null): void {
        const db = DatabaseConnection.connect();
        const caseId = ModUtils.getLastestCaseId();
        db.prepare(
            'INSERT INTO moderationLogs (serverId, caseId, modId, userId, type,' +
            'reason, timeout, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(serverId, caseId + 1, modId, userId, type, reason, timeout, timestamp);

        db.close();
    }
}
