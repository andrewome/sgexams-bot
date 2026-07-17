import { DatabaseConnection } from '../../DatabaseConnection';
import { ModActions } from './classes/ModActions';
import { ModerationTimeout } from './classes/ModerationTimeout';

/**
 * The setTimeout-rearming DB rows behind ModUtils' ban/mute timers - a different kind of
 * concern to ModerationLog (in-memory timers backed by persistence, not audit data).
 * See ADR-0003.
 */
export class ModerationTimeouts {
    /** Records (or, on conflict of serverId/userId/type, updates) an open timeout's timerId. */
    public static schedule(startTime: number, endTime: number, userId: string,
                           type: ModActions, serverId: string, timerId: number): void {
        const db = DatabaseConnection.connect();
        db.prepare(
            'INSERT INTO moderationTimeouts (serverId, userId, type, startTime, endTime, timerId) ' +
            'VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(serverId, userId, type) DO UPDATE SET timerId = excluded.timerId',
        ).run(serverId, userId, type, startTime, endTime, timerId);
        db.close();
    }

    /** Removes an open timeout. Returns its timerId, or 0 if there was nothing to cancel. */
    public static cancel(userId: string, type: ModActions, serverId: string): number {
        const db = DatabaseConnection.connect();
        const res = db.prepare<unknown[], { timerId: number }>(
            'SELECT timerId FROM moderationTimeouts WHERE serverId = ? AND userId = ? AND type = ?',
        ).get(serverId, userId, type);

        let timerId = 0;
        if (res) {
            timerId = res.timerId;
            db.prepare(
                'DELETE FROM moderationTimeouts WHERE serverId = ? AND userId = ? AND type = ?',
            ).run(serverId, userId, type);
        }
        db.close();
        return timerId;
    }

    /** All open timeouts, across every server - used to re-arm timers on bot restart. */
    public static allOpen(): ModerationTimeout[] {
        const db = DatabaseConnection.connect();
        const res = db.prepare<unknown[], ModerationTimeout>('SELECT * FROM moderationTimeouts').all();
        db.close();
        return res;
    }
}
