import { SqliteError } from 'better-sqlite3';
import log from 'loglevel';
import { Server } from '../storage/Server';
import { Storage } from '../storage/Storage';

/** Base class of Event Handlers */
export abstract class EventHandler {
    protected storage: Storage;

    public constructor(storage: Storage) {
        this.storage = storage;
    }

    /**
     * Retrieves server object from server map
     *
     * @param  {string} id Server Id
     * @returns Server
     */
    protected getServer(id: string): Server {
        if (this.storage.servers.has(id) === false) {
            this.storage.initNewServer(id);
        }
        return this.storage.servers.get(id)!;
    }

    /**
     * Warn uncaught error. If sqlite error shut bot down.
     *
     * @param  {Error} err
     * @returns void
     */
    protected handleError(err: Error): void {
        log.warn(`Uncaught error in ${this.constructor.name}.`);
        log.warn(err.stack);
        if (err instanceof SqliteError) {
            log.error('Sqlite Error detected. Shutting down.');
            process.exit();
        }
    }

    /**
     * Handles events by discord.js
     *
     * @returns void
     */
    abstract handleEvent(): void;
}
