import log from 'loglevel';
import Database from 'better-sqlite3';

export class DatabaseConnection {

    private static DEBUG = false;

    private static storagePath = './servers.db';

    public static setStoragePath(path: string): void {
        this.storagePath = path;
    }

    public static getStoragePath(): string {
        return this.storagePath;
    }

    /**
     * This method returns a database connection from the stated storagepath.
     *
     * @returns Database
     */
    public static connect(): Database.Database {
        return new Database(this.storagePath, { verbose: this.DEBUG ? log.debug : undefined });
    }

    /**
     * Method to initialise a new database. To be called if database file does not exist.
     *
     * @returns void
     */
    public static initDatabase(): void {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const { initStatements } = require('../../database/init.js');
        const db = new Database(this.storagePath, { verbose: this.DEBUG ? log.debug : undefined });
        for (const initStatement of initStatements) {
            db.prepare(initStatement).run();
        }
        db.close();
    }

    /**
     * Method to store moderation logs.
     *
     * @returns void
     */
    public static addModeration(userID: string,
                                moderatorID: string,
                                action: string,
                                reason: string): void {
        const db = this.connect();
        // Add Moderation Action
        db.prepare(`
            INSERT INTO moderationActions (userID, moderatorID, action, reason) 
            VALUES (${userID}, ${moderatorID},'${action}', '${reason}');
        `).run();

        // Update Moderation Count
        const userLog = db.prepare(`SELECT * FROM warnCounts WHERE userID = ${userID}`).get();
        if (userLog !== undefined && userLog.userID === userID && action === 'Warn') {
            // Updates Entry If Already Exists
            db.prepare(`
                UPDATE warnCounts
                SET warnCount = ${userLog.warnCount + 1}
                WHERE userID = ${userLog.userID}
            `).run();
        } else {
            // Create a New Entry
            db.prepare(`INSERT INTO warnCounts VALUES (${userID}, 1)`).run();
        }
    }
}
