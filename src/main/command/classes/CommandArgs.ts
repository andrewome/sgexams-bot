import {
 Permissions, Channel, GuildChannelManager, GuildEmojiManager
} from 'discord.js';
import { Server } from '../../storage/Server';

/** This class contains the arguments for the Command class */
export class CommandArgs {
    public server: Server;

    public memberPerms: Readonly<Permissions>;

    public messageReply: Function;

    public uptime: number | undefined;

    public channels: GuildChannelManager | undefined;

    public emojis: GuildEmojiManager | undefined;

    public channel: Channel | undefined;

    public userId: string | undefined;

    public deleteFunction: Function | undefined;

    public constructor(server: Server, memberPerms: Readonly<Permissions>,
                       messageReply: Function, uptime?: number,
                       channels?: GuildChannelManager,
                       emojis?: GuildEmojiManager,
                       channel?: Channel, userId?: string,
                       deleteFunction?: Function) {
        this.server = server;
        this.memberPerms = memberPerms;
        this.uptime = uptime;
        this.messageReply = messageReply;
        this.channels = channels;
        this.emojis = emojis;
        this.channel = channel;
        this.userId = userId;
        this.deleteFunction = deleteFunction;
    }
}
