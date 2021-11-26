import {
    Permissions, GuildChannelManager, GuildEmojiManager,
    GuildMemberManager, RoleManager, TextChannel, ThreadChannel,
} from 'discord.js';
import { Server } from '../../storage/Server';

/** This interface contains the arguments for the Command class */
export interface CommandArgs {
    server: Server;

    memberPerms: Readonly<Permissions>;

    messageReply: Function;

    deleteFunction?: Function;

    emit?: Function;

    uptime?: number | null;

    channels?: GuildChannelManager;

    emojis?: GuildEmojiManager;

    members?: GuildMemberManager;

    channel?: TextChannel | ThreadChannel;

    userId?: string;

    messageId?: string;

    botId?: string;

    roles?: RoleManager;
}
