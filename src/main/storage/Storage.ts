import log from 'loglevel';
import { Server } from './Server';
import { connect } from '../database';

interface MessageCheckerSettings {
    bannedWords: string[];
    deleteMessage: boolean;
    reportingChannelId: string | null;
    responseMessage: string | null;
}

interface StarboardEmoji {
    id: string;
    name: string;
}

interface StarboardSettings {
    channel: string;
    threshold: number;
    emojis: StarboardEmoji[];
}

/** This represents all the servers that the bot is keeping track of */
export class Storage {
    /** Map of ID & Server objects */
    public servers: Map<string, Server> = new Map<string, Server>();

    /**
     * Loads servers from STORAGE_PATH and serialised it into actual objects
     *
     * @returns Storage
     */
    public loadServers(): Storage {
        log.info('Loading Servers...');
        const db = connect();

        // Retrieve servers from the DB
        const selectServers = db.prepare('SELECT * FROM servers');
        const servers = selectServers.all();

        for (const { serverId } of servers) {
            // Load additional settings from the DB
            const starboardSettings = Storage.getStarboardSettingsFromDb(
                db,
                serverId,
            );
            const messageCheckerSettings = Storage.getMessageCheckerSettingsFromDb(
                db,
                serverId,
            );

            // Convert to an actual Server object and store it
            const server = Server.convertFromJsonFriendly({
                serverId,
                starboardSettings,
                messageCheckerSettings,
            });
            this.servers.set(server.serverId, server);
        }
        log.info(`Loaded ${this.servers.size} server(s).`);
        return this;
    }

    /**
     * Returns an object containing the StarboardSettings for the server,
     * retrieved from the database.
     *
     * @param db The database connection to use.
     * @param serverId The ID of the server whose settings are to be retrieved.
     * @returns An object containing the StarboardSettings for the server.
     */
    private static getStarboardSettingsFromDb(db: any, serverId: string): StarboardSettings {
        // Retrieve settings and emojis from the DB
        const selectSettings = db.prepare(
            `SELECT * FROM starboardSettings WHERE serverId = ${serverId}`,
        );
        const selectEmojis = db.prepare(
            `SELECT * FROM starboardEmojis WHERE serverId = ${serverId}`,
        );
        const starboardSettings = selectSettings.get();
        const starboardEmojis = selectEmojis.all();

        // Merge emojis with the main starboardSettings object
        starboardSettings.emojis = [];
        for (const emoji of starboardEmojis) {
            starboardSettings.emojis.push({
                id: emoji.id,
                name: emoji.name,
            });
        }

        return starboardSettings;
    }

    /**
     * Returns an object containing the MessageCheckerSettings for the server,
     * retrieved from the database.
     *
     * @param db The database connection to use.
     * @param serverId The ID of the server whose settings are to be retrieved.
     * @returns An object containing the MessageCheckerSettings for the server.
     */
    private static getMessageCheckerSettingsFromDb(
        db: any, serverId: string,
    ): MessageCheckerSettings {
        // Retrieve settings and banned words from the DB
        const selectSettings = db.prepare(
            `SELECT * FROM messageCheckerSettings WHERE serverId = ${serverId}`,
        );
        const selectBannedWords = db.prepare(
            `SELECT * FROM messageCheckerBannedWords WHERE serverId = ${serverId}`,
        );
        const messageCheckerSettings = selectSettings.get();
        const messageCheckerBannedWords = selectBannedWords.all();

        // Merge banned words with the main messageCheckerSettings object
        messageCheckerSettings.bannedWords = [];
        for (const bannedWord of messageCheckerBannedWords) {
            messageCheckerSettings.bannedWords.push(bannedWord.word);
        }

        return messageCheckerSettings;
    }
}
