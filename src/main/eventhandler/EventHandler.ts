import { Server } from '../storage/Server';
import { Storage } from '../storage/Storage';
import { MessageCheckerSettings } from '../storage/MessageCheckerSettings';
import { StarboardSettings } from '../storage/StarboardSettings';

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
            this.storage.servers.set(id,
                                     new Server(id,
                                     new MessageCheckerSettings(),
                                     new StarboardSettings(null, null, null)));
        }
        return this.storage.servers.get(id)!;
    }

    /**
     * Handles events by discord.js
     *
     * @returns void
     */
    abstract handleEvent(): void;
}
