import * as fs from "fs";
import { Server } from "./Server";
import log from "loglevel";

/** This represents all the servers that the bot is keeping track of */
export class Storage {
    /** Map of ID & Server objects */
    public servers: Map<string, Server> = new Map<string, Server>();

    /** Storage path */
    private STORAGE_PATH = "./servers.json"

    /**
     * Loads servers from STORAGE_PATH and serialised it into actual objects
     *  
     * @returns Storage
     */
    public loadServers(): Storage {
        try {
            const servers = fs.readFileSync(this.STORAGE_PATH, "utf8");
            let objects = JSON.parse(servers);
            for(let object of objects) {
                let server = Server.convertFromJsonFriendly(object);
                this.servers.set(server.serverId, server);
            }
        } catch(err) {
            // File not found, create empty file
            if(err.code === "ENOENT") {
                fs.writeFileSync(this.STORAGE_PATH, "");
            } else { // Other errors, throw up the chain
                throw err;
            }
        }
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
        let serverJsons = [];
        for(let [k, v] of this.servers) {
            serverJsons.push(Server.convertToJsonFriendly(v))
        }
        fs.writeFileSync(this.STORAGE_PATH, JSON.stringify(serverJsons));
        log.info("Saving Servers...");
    }

    public setStoragePath(str: string) {
        this.STORAGE_PATH = str;
    }
}