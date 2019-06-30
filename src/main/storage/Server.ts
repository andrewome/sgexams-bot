import { MessageCheckerSettings } from './MessageCheckerSettings';
import { StarboardSettings } from './StarboardSettings';

/** This class represents a server object that the bot references from */
export class Server {
    public serverId: string;

    public messageCheckerSettings: MessageCheckerSettings;

    public starboardSettings: StarboardSettings;

    public constructor(serverId: string,
                       messageCheckerSettings: MessageCheckerSettings,
                       starboardSettings: StarboardSettings) {
        this.serverId = serverId;
        this.messageCheckerSettings = messageCheckerSettings;
        this.starboardSettings = starboardSettings;
    }

    /**
     * Tests if server objects are the same.
     *
     * @param {Server} other
     */
    public equals(other: Server): boolean {
        if (this.serverId !== other.serverId) return false;

        if (!this.messageCheckerSettings.equals(other.messageCheckerSettings)) return false;

        return true;
    }

    /**
     * This function converts the server object to an object
     * that can be easily converted into a JSON object
     *
     * @param  {Server} server Server object
     * @returns any
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    public static convertToJsonFriendly(server: Server): any {
        const out: any = {};
        out.serverId = server.serverId;
        const { messageCheckerSettings } = server;
        out.messageCheckerSettings
            = MessageCheckerSettings.convertToJsonFriendly(messageCheckerSettings);
        const { starboardSettings } = server;
        out.starboardSettings
            = starboardSettings;
        return out;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    /**
     * This function converts an object back into a server object
     * Used for deserialising.
     *
     * @param  {any} obj
     * @returns Server
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    public static convertFromJsonFriendly(obj: any): Server {
        // Check attributes
        if (!(obj.hasOwnProperty('messageCheckerSettings')
             && obj.hasOwnProperty('serverId'))) {
            throw new Error('Object is not valid');
        }

        let starboardSettings: StarboardSettings;
        if(!obj.hasOwnProperty('starboardSettings')) {
            starboardSettings = new StarboardSettings(null, null, null);
        } else {
            starboardSettings = StarboardSettings.convertFromJsonFriendly(obj.starboardSettings);
        }

        const { serverId } = obj;
        const messageCheckerSettings
            = MessageCheckerSettings.convertFromJsonFriendly(obj.messageCheckerSettings);
        return new Server(serverId, messageCheckerSettings, starboardSettings);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
}
