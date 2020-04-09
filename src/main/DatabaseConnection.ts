import log from 'loglevel';
import Database from 'better-sqlite3';

export class DatabaseConnection {
    private static STORAGE_PATH = './servers.db';

    private static DEBUG = true;

    public static setStoragePath(path: string): void {
        this.STORAGE_PATH = path;
    }

    public static connect(): Database.Database {
        return new Database(this.STORAGE_PATH, { verbose: this.DEBUG ? log.debug : undefined });
    }

}
