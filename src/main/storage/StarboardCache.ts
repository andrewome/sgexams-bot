import {
 Guild, Client, TextChannel, Collection, Message,
} from 'discord.js';
import { Storage } from './Storage';

export class StarboardServerCache {
    /** [0] is messageId, [1] is starboard message id. */
    private cache: [string, string | null][];

    public static LIMIT = 200;

    public static ORIGINAL_SIZE = 100;

    public constructor() {
        this.cache = [];
    }

    /**
     * Check if message exists in starboard channel
     *
     * @param  {string} id
     * @returns boolean
     */
    public messageExists(id: string): boolean {
        for (const pair of this.cache) {
            const messageId = pair[0];
            if (messageId === id) { return true; }
        }

        return false;
    }

    /**
     * Check if starboard id exists
     *
     * @param  {string} id
     * @returns boolean
     */
    public starboardMessageExists(id: string): boolean {
        for (const pair of this.cache) {
            const messageId = pair[1];
            if (messageId === id) return true;
        }

        return false;
    }

    /**
     * Get starboard message id from a given message id.
     *
     * @param  {string} id
     * @returns string
     */
    public getStarboardMessageId(id: string): string | null {
        for (const pair of this.cache) {
            const messageId = pair[0];
            if (messageId === id) return pair[1];
        }
        return null;
    }

    /**
     * Add messageId, starboardMessageId pair to the cache
     *
     * @param  {string} messageId
     * @param  {string} starboardMessageId
     * @returns void
     */
    public addToCache(messageId: string, starboardMessageId: string): void {
        // Unshift (add to front) because that is how ids are fetched.
        // Newest at the front, older at the back.
        this.cache.unshift([messageId, starboardMessageId]);
    }

    /**
     * Allows for messageId to be added first, starboardmessageid is added later.
     *
     * @param  {string} id
     * @returns reference to array that needs the starboard id to be added.
     */
    public addMessageIdToCacheFirst(id: string): [string, string | null] {
        this.cache.unshift([id, null]);
        return this.cache[0];
    }

    /**
     * If cache is getting too big, trim it down to original size.
     *
     * @returns void
     */
    public trimCache(): void {
        if (this.cache.length >= StarboardServerCache.LIMIT) {
            while (this.cache.length > StarboardServerCache.ORIGINAL_SIZE) {
                this.cache.pop();
            }
        }
    }
}

export abstract class StarboardCache {
    public static starboardMessageCache: Map<string, StarboardServerCache> = new Map();

    /**
     * This function is meant to be used on start up.
     * Iterates through all guilds that the bot is in and
     * adds messages in the starboard channel into its cache.
     *
     * @param  {Client} bot
     * @param  {Storage} storage
     * @returns void
     */
    public static generateStarboardMessagesCache(bot: Client, storage: Storage): void {
        const { starboardMessageCache } = StarboardCache;

        // Check all the guilds that the bot is in
        const { guilds } = bot;
        guilds.forEach((guild: Guild): void => {
            const { id } = guild;
            if (!storage.servers.has(id)) {
                return;
            }

            // If set does not exist, add new set
            if (!starboardMessageCache.has(id)) {
                starboardMessageCache.set(id, new StarboardServerCache());
            }

            // Get server and settings
            const server = storage.servers.get(id)!;
            const { starboardSettings } = server;

            // Check if starboard channelId or channel does not exist
            const starboardCache = starboardMessageCache.get(id)!;
            const channelId = starboardSettings.getChannel()!;
            if (!guild.channels.has(channelId) || channelId === null) return;

            // Add starboard IDs to cache
            const channel = guild.channels.get(channelId);
            (channel as TextChannel).fetchMessages({ limit: 100 })
                .then((messages: Collection<string, Message>): void => {
                    for (const message of messages.array()) {
                        // Assuming message id is the last index
                        const splittedMsg = message.content.split(' ');
                        const { length } = splittedMsg;
                        const msgId = splittedMsg[length - 1];
                        starboardCache.addToCache(msgId, message.id);
                    }
                });
        });
    }

    /**
     * Adds message to cache when addStarboardMessage is triggered.
     * @param  {string} guildId
     * @param  {string} messageId
     * @returns void
     */
    public static addStarboardMessageToCache(guildId: string,
                                             messageId: string,
                                             starboardMessageId: string): void {
        const { starboardMessageCache } = StarboardCache;
        const serverCache = starboardMessageCache.get(guildId)!;
        serverCache.addToCache(messageId, starboardMessageId);
        serverCache.trimCache();
    }

    /**
     * Wrapper to add messageId first to cache
     *
     * @param  {string} guildId
     * @returns reference to array that needs the starboard id to be added.
     */
    public static addMessageToCacheFirst(guildId: string,
                                         messageId: string): [string, string | null] {
        const { starboardMessageCache } = StarboardCache;
        const serverCache = starboardMessageCache.get(guildId)!;
        return serverCache.addMessageIdToCacheFirst(messageId);
    }
}
