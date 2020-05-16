import { DatabaseConnection } from '../../DatabaseConnection';
import { ModActions } from './ModActions';
import { GuildMemberManager } from 'discord.js';

export class ModUtils {
    public static readonly MINUTES_IN_SECONDS = 60;

    public static readonly HOURS_IN_SECONDS = ModUtils.MINUTES_IN_SECONDS * 60;

    public static readonly DAYS_IN_SECONDS = ModUtils.HOURS_IN_SECONDS * 24;

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
        const db = DatabaseConnection.connect();
        db.prepare(
            'INSERT INTO moderationTimeouts (serverId, userId, type, endTime) VALUES (?, ?, ?, ?)',
        ).run(serverId, userId, ModActions.BAN, endTime);
        db.close();

        ModUtils.setBanTimeout(duration, userId, serverId, guildMemberManager);
    }

    /**
     * This function handles the timeout of the ban to unban the user when timeout is up.
     *
     * @param  {number} duration
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {GuildMemberManager} guildMemberManager
     * @returns void
     */
    public static setBanTimeout(duration: number, userId: string, serverId: string,
                                guildMemberManager: GuildMemberManager): void {
        const cb = (): void => {
            // Unban member
            guildMemberManager.unban(userId);

            // Remove entry from db
            const db = DatabaseConnection.connect();
            db.prepare(
                'DELETE FROM moderationTimeouts WHERE serverId = ? AND userId = ? AND type = ?',
            ).run(serverId, userId, ModActions.BAN);

            // Add unban entry to db
            ModUtils.addModerationAction(serverId, 'AUTO', userId, ModActions.UNBAN, ModUtils.getUnixTime());
            db.close();
        };

        setTimeout(cb, duration * 1000);
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
                                      timeout?: number): void {
        const db = DatabaseConnection.connect();
        const caseId = ModUtils.getLastestCaseId();
        db.prepare(
            'INSERT INTO moderationLogs (serverId, caseId, modId, userId, type,' +
            'reason, timeout, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(serverId, caseId + 1, modId, userId, type, reason, timeout, timestamp);

        db.close();
    }
}
