import Database from 'better-sqlite3';
import { DatabaseConnection } from '../../DatabaseConnection';
import { ModActions } from './classes/ModActions';
import { App } from '../../App';
import { ModLog } from './classes/ModLog';

export interface WarnRule {
    type: ModActions;
    duration: number | null;
}

export interface WarnRuleSetting extends WarnRule {
    numWarns: number;
}

export interface EntriesFilter {
    userId?: string;
    type?: ModActions;
}

/**
 * The case-numbered moderation audit trail: logged actions, warn-escalation rules, and the
 * mod-log channel setting. See ADR-0003.
 */
export class ModerationLog {
    /**
     * Records a moderation action and emits MODLOG_UPDATE with the created entry.
     * reason || null because reason could be an empty string, in which case we want to record
     * null in the database.
     *
     * @returns the recorded ModLog, including its assigned caseId
     */
    public static record(serverId: string, modId: string, userId: string, type: ModActions,
                         timestamp: number, emit: Function, reason?: string | null,
                         timeout?: number | null): ModLog {
        const db = DatabaseConnection.connect();
        const caseId = (ModerationLog.latestCaseId(db, serverId)) + 1;
        db.prepare(
            'INSERT INTO moderationLogs (serverId, caseId, modId, userId, type,' +
            ' reason, timeout, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(serverId, caseId, modId, userId, type, reason || null, timeout, timestamp);
        db.close();

        const modLog: ModLog = {
            serverId, caseId, modId, userId, type, reason: reason || null,
            timeout: timeout || null, timestamp,
        };
        emit(App.MODLOG_UPDATE, modLog);
        return modLog;
    }

    /**
     * Returns this server's logged moderation actions, newest first, optionally filtered by
     * user and/or action type.
     */
    public static entries(serverId: string, filter?: EntriesFilter): ModLog[] {
        const clauses = ['serverId=?'];
        const params: string[] = [serverId];
        if (filter?.userId) {
            clauses.push('userId=?');
            params.push(filter.userId);
        }
        if (filter?.type) {
            clauses.push('type=?');
            params.push(filter.type);
        }

        const db = DatabaseConnection.connect();
        const res = db.prepare<unknown[], ModLog>(
            `SELECT * FROM moderationLogs WHERE ${clauses.join(' AND ')} ORDER BY caseId DESC`,
        ).all(...params);
        db.close();
        return res;
    }

    /** Number of WARN entries logged against this user. */
    public static warnCount(serverId: string, userId: string): number {
        const db = DatabaseConnection.connect();
        const res = db.prepare<unknown[], { 'COUNT(*)': number }>(
            'SELECT COUNT(*) FROM moderationLogs WHERE serverId = ? AND userId = ? AND type = ?',
        ).get(serverId, userId, ModActions.WARN);
        db.close();
        return res ? res['COUNT(*)'] : 0;
    }

    /** Deletes a WARN entry by caseId. Returns false if it didn't exist. */
    public static deleteWarnEntry(serverId: string, caseId: number): boolean {
        const db = DatabaseConnection.connect();
        const res = db.prepare(
            'DELETE FROM moderationLogs WHERE serverId = ? AND caseId = ? AND type = ?',
        ).run(serverId, caseId, ModActions.WARN);
        db.close();
        return !!res.changes;
    }

    /** The escalation rule (if any) configured for a given warn count. */
    public static warnRuleFor(serverId: string, numWarns: number): WarnRule | null {
        const db = DatabaseConnection.connect();
        const res = db.prepare<unknown[], WarnRule>(
            'SELECT type, duration FROM moderationWarnSettings WHERE serverId = ? AND numWarns = ?',
        ).get(serverId, numWarns);
        db.close();
        return res ?? null;
    }

    public static setWarnRule(serverId: string, numWarns: number, type: ModActions,
                              duration: number | null): void {
        const db = DatabaseConnection.connect();
        db.prepare(
            'INSERT INTO moderationWarnSettings (serverId, numWarns, type, duration) VALUES (?, ?, ?, ?)',
        ).run(serverId, numWarns, type, duration);
        db.close();
    }

    public static clearWarnRules(serverId: string): void {
        const db = DatabaseConnection.connect();
        db.prepare('DELETE FROM moderationWarnSettings WHERE serverId = ?').run(serverId);
        db.close();
    }

    public static warnRules(serverId: string): WarnRuleSetting[] {
        const db = DatabaseConnection.connect();
        const res = db.prepare<unknown[], WarnRuleSetting>(
            'SELECT numWarns, type, duration FROM moderationWarnSettings WHERE serverId = ?',
        ).all(serverId);
        db.close();
        return res;
    }

    public static logChannel(serverId: string): string | null {
        const db = DatabaseConnection.connect();
        const res = db.prepare<unknown[], { channelId: string | null }>(
            'SELECT channelId FROM moderationSettings WHERE serverId = ?',
        ).get(serverId);
        db.close();
        return res!.channelId;
    }

    public static setLogChannel(serverId: string, channelId: string | null): void {
        const db = DatabaseConnection.connect();
        db.prepare('UPDATE moderationSettings SET channelId = ? WHERE serverId = ?').run(channelId, serverId);
        db.close();
    }

    /** Not part of the public interface - only record() needs it, to assign the next caseId. */
    private static latestCaseId(db: Database.Database, serverId: string): number {
        const res = db.prepare<unknown[], { caseId: number }>(
            'SELECT caseId FROM moderationLogs WHERE serverId = ? ORDER BY caseId DESC',
        ).get(serverId);
        return res ? res.caseId : 0;
    }
}
