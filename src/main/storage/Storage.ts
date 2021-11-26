import log from 'loglevel';
import { Database } from 'better-sqlite3';
import { Server } from './Server';
import { DatabaseConnection } from '../DatabaseConnection';
import { MessageCheckerSettingsObj, MessageCheckerSettings } from './MessageCheckerSettings';
import { StarboardSettingsObj, StarboardSettings } from './StarboardSettings';

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

        // Run any database initialization/migration methods if necessary.
        DatabaseConnection.initOrMigrateDatabase();

        const db = DatabaseConnection.connect();

        // Retrieve servers from the DB
        const selectServers = db.prepare('SELECT * FROM servers');
        const servers = selectServers.all();

        for (const { serverId } of servers) {
            // Load additional settings from the DB
            const starboardSettings = this.getStarboardSettingsFromDb(
                db,
                serverId,
            );
            const messageCheckerSettings = this.getMessageCheckerSettingsFromDb(
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
        db.close();
        log.info(`Loaded ${this.servers.size} server(s).`);
        return this;
    }

    /**
     * Initialises a new server by adding to map and creating a db entry for it.
     *
     * @param  {string} severId
     * @returns void
     */
    public initNewServer(serverId: string): void {
        // Set to map
        this.servers.set(
            serverId,
            new Server(
                serverId,
                new MessageCheckerSettings(null, null, null, null),
                new StarboardSettings(null, null, null),
            ),
        );

        // Add to db
        const db = DatabaseConnection.connect();
        db.prepare('INSERT INTO servers (serverId) VALUES (?)').run(serverId);
        db.prepare(
            'INSERT INTO messageCheckerSettings (serverId, reportingChannelId, responseMessage,' +
            ' deleteMessage) VALUES (?, ?, ?, ?)',
        ).run(serverId, null, null, null);
        db.prepare(
            'INSERT INTO starboardSettings (serverId, channel, threshold) VALUES (?, ?, ?)',
        ).run(serverId, null, null);
        db.prepare(
            'INSERT INTO moderationSettings(serverId, channelId, muteRoleId) VALUES (?, ?, ?)',
        ).run(serverId, null, null);
        db.close();
    }

    /**
     * Returns an object containing the StarboardSettings for the server,
     * retrieved from the database.
     *
     * @param db The database connection to use.
     * @param serverId The ID of the server whose settings are to be retrieved.
     * @returns An object containing the StarboardSettings for the server.
     */
    private getStarboardSettingsFromDb(db: Database,
                                       serverId: string): StarboardSettingsObj {
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
    private getMessageCheckerSettingsFromDb(db: Database,
                                            serverId: string): MessageCheckerSettingsObj {
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

    /**
     * Compares if 2 storage objects are the same
     *
     * @param  {Storage} other
     * @returns boolean
     */
    public equals(other: Storage): boolean {
        let isEqual = true;
        const otherServers = other.servers;
        this.servers.forEach((v: Server, k: string): void => {
            if (otherServers.has(k)) {
                const server = otherServers.get(k);
                if (!server?.equals(v))
                    isEqual = false;
            } else {
                isEqual = false;
            }
        });
        return isEqual;
    }
}
