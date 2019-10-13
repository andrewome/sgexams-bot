import {
 Permissions, Collection, Emoji, Channel,
} from 'discord.js';
import { Server } from '../../storage/Server';

/** This class contains the arguments for the Command class */
export class CommandArgs {
    public server: Server;

    public memberPerms: Permissions;

    public messageReply: Function;

    public uptime: number | undefined;

    public channels: Collection<string, Channel> | undefined;

    public emojis: Collection<string, Emoji> | undefined;

    public channel: Channel | undefined;

    public userId: string | undefined;

    public constructor(server: Server, memberPerms: Permissions,
                       messageReply: Function, uptime?: number,
                       channels?: Collection<string, Channel>,
                       emojis?: Collection<string, Emoji>,
                       channel?: Channel, userId?: string) {
        this.server = server;
        this.memberPerms = memberPerms;
        this.uptime = uptime;
        this.messageReply = messageReply;
        this.channels = channels;
        this.emojis = emojis;
        this.channel = channel;
        this.userId = userId;
    }
}
