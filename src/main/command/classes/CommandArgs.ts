import {
    Permissions, Channel, GuildChannelManager, GuildEmojiManager,
} from 'discord.js';
import { Server } from '../../storage/Server';

/** This interface contains the arguments for the Command class */
export interface CommandArgs {
    server: Server;

    memberPerms: Readonly<Permissions>;

    messageReply: Function;

    deleteFunction?: Function;

    uptime?: number | null;

    channels?: GuildChannelManager;

    emojis?: GuildEmojiManager;

    channel?: Channel;

    userId?: string;
}
