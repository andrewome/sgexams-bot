import { PermissionsBitField, PermissionFlagsBits } from 'discord.js';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { Server } from '../../../main/storage/Server';
import { FakeMemberAdapter } from '../../modules/moderation/FakeMemberAdapter';

export const adminPerms = new PermissionsBitField([PermissionFlagsBits.Administrator]);

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noopMessageReply = async (): Promise<void> => {};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noopEmit = (): void => {};

/** Shared CommandArgs base for the moderation commands migrated onto DiscordMemberPort. */
export const baseCommandArgs = (server: Server, memberActions: FakeMemberAdapter): CommandArgs => ({
    server,
    serverName: 'Test Server',
    memberPerms: adminPerms,
    messageReply: noopMessageReply,
    userId: 'modId',
    botId: 'botId',
    emit: noopEmit,
    memberActions,
});
