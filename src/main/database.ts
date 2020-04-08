import Database from 'better-sqlite3';

const DEBUG = false;
const STORAGE_PATH = './servers.db';

export function connect(): any {
    return new Database(STORAGE_PATH, { verbose: DEBUG ? console.log : undefined });
}
