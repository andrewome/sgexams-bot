import { DatabaseConnection } from '../../DatabaseConnection';
import { ModActions } from './ModActions';

export class ModDbUtils {
    /**
     * Returns the latest case number of a specified server from mod log table
     * @param {string} serverId
     * @returns number
     */
    public static getLastestCaseId(serverId: string): number {
        const db = DatabaseConnection.connect();
        const res = db.prepare(
            'SELECT caseId FROM moderationLogs WHERE serverId = ? ORDER BY caseId DESC',
        ).get(serverId);
        db.close();
        return res ? res.caseId : 0;
    }

    /**
     * Adds an action with a timeout into the timeout database
     *
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {ModActions} type
     * @param  {string} serverId
     */
    public static addActionTimeout(endTime: number, userId: string, type: ModActions,
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
     * @returns number timerId if success, 0 if fail
     */
    public static removeActionTimeout(userId: string, type: ModActions,
                                      serverId: string): number {
        const db = DatabaseConnection.connect();

        // Get the timerId
        const res = db.prepare(
            'SELECT timerId FROM moderationTimeouts WHERE serverId = ? AND userId = ? AND type = ?',
        ).get(serverId, userId, type);

        let timerId = 0;
        // If entry exists, remove
        if (res) {
            timerId = res.timerId;
            // Delete row
            db.prepare(
                'DELETE FROM moderationTimeouts WHERE serverId = ? AND userId = ? AND type = ?',
            ).run(serverId, userId, type);
        }
        db.close();

        return timerId;
    }

    /**
     * Adds a mod action into the database
     *
     * @param  {string} serverId
     * @param  {string} modId
     * @param  {string} userId
     * @param  {ModActions} type
     * @param  {number} timestamp
     * @param  {string|null} reason?
     * @param  {number|null} timeout?
     * @returns void
     */
    public static addModerationAction(serverId: string, modId: string, userId: string,
                                      type: ModActions, timestamp: number, reason?: string|null,
                                      timeout?: number|null): void {
        const db = DatabaseConnection.connect();
        const caseId = ModDbUtils.getLastestCaseId(serverId);
        db.prepare(
            'INSERT INTO moderationLogs (serverId, caseId, modId, userId, type,' +
            ' reason, timeout, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(serverId, caseId + 1, modId, userId, type, reason, timeout, timestamp);

        db.close();
    }

}
