import * as fs from 'fs';
import log from 'loglevel';
import { Server } from './Server';

/** This represents all the servers that the bot is keeping track of */
export class Storage {
    /** Map of ID & Server objects */
    public servers: Map<string, Server> = new Map<string, Server>();

    /** Storage path */
    private STORAGE_PATH = './servers.json'

    /**
     * Loads servers from STORAGE_PATH and serialised it into actual objects
     *
     * @returns Storage
     */
    public loadServers(): Storage {
        log.info('Loading Servers...');
        try {
            const servers = fs.readFileSync(this.STORAGE_PATH, 'utf8');
            const objects = JSON.parse(servers);
            for (const object of objects) {
                const server = Server.convertFromJsonFriendly(object);
                this.servers.set(server.serverId, server);
            }
        } catch (err) {
            // File not found, create empty file
            if (err.code === 'ENOENT') {
                log.info('servers.json not found - creating empty file');
                fs.writeFileSync(this.STORAGE_PATH, '');
            } else { // Other errors, throw up the chain
                throw err;
            }
        }
        log.info(`Loaded ${this.servers.size} server(s).`);
        return this;
    }

    /**
     * Save servers to STORAGE_PATH
     * Converts each server object to something that can
     * be easily JSON.stringified() to.
     *
     * @returns void
     */
    public saveServers(): void {
        const serverJsons = [];
        log.info('Saving Servers...');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [k, v] of this.servers) {
            log.debug(`Serialising ${k}...`);
            serverJsons.push(Server.convertToJsonFriendly(v));
        }
        fs.writeFileSync(this.STORAGE_PATH, JSON.stringify(serverJsons));
        log.info('Saved Servers!');
    }

    public setStoragePath(str: string): void {
        this.STORAGE_PATH = str;
    }
}
