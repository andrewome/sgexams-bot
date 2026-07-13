/* eslint-disable no-unused-expressions */
import {
    PermissionsBitField, EmbedBuilder, MessageReplyOptions,
} from 'discord.js';
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { BanCommand } from '../../../main/command/moderationcommands/BanCommand';
import { Command } from '../../../main/command/Command';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';
import { ModDbUtils } from '../../../main/modules/moderation/ModDbUtils';
import { ModActions } from '../../../main/modules/moderation/classes/ModActions';
import { FakeMemberAdapter } from '../../modules/moderation/FakeMemberAdapter';
import { baseCommandArgs, noopMessageReply } from './ModCommandTestHelper';

should();

const { EMBED_DEFAULT_COLOUR } = Command;
const { EMBED_ERROR_COLOUR } = Command;
const { DURATION_TOO_LONG } = BanCommand;

describe('BanCommand test suite', (): void => {
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    let server: Server;
    let memberActions: FakeMemberAdapter;
    const serverId = '69420';
    const targetId = '111';
    beforeEach((): void => {
        new Storage().loadServers().initNewServer(serverId);
        server = new Storage().loadServers().servers.get(serverId)!;
        memberActions = new FakeMemberAdapter();
    });

    afterEach((): void => {
        deleteDbFile();
    });

    const baseArgs = (): ReturnType<typeof baseCommandArgs> => baseCommandArgs(server, memberActions);

    it('No permissions', async (): Promise<void> => {
        const command = new BanCommand([targetId]);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equals(EMBED_ERROR_COLOUR);
        };
        const commandResult = await command.execute({
            ...baseArgs(), memberPerms: new PermissionsBitField([]), messageReply: checkEmbed,
        });
        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(0);
    });

    it('Duration over 21 days is rejected', async (): Promise<void> => {
        const command = new BanCommand([targetId, 'reason', '22d']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.fields![0].value.should.equal(`${DURATION_TOO_LONG}\n${BanCommand.COMMAND_USAGE}`);
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });
        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(0);
    });

    it('Permanent ban (no duration) succeeds and records the action', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        const command = new BanCommand([targetId, 'being', 'bad']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_DEFAULT_COLOUR);
            embed.fields![0].value.should.equal('Target#0001 was banned.');
            embed.fields![1].value.should.equal('being bad');
            embed.fields![2].name.should.equal('Length');
            embed.fields![2].value.should.equal('Permanent');
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(1);
        memberActions.calls[0].method.should.equal('ban');
        memberActions.calls[0].userId.should.equal(targetId);
        const logs = ModDbUtils.getModLogs(serverId, targetId, ModActions.BAN);
        logs.length.should.equal(1);
        logs[0].reason!.should.equal('being bad');
        (logs[0].timeout === null).should.be.true;
    });

    it('Ban with a duration records the timeout', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        const command = new BanCommand([targetId, 'reason', '3d']);
        const commandResult = await command.execute({ ...baseArgs(), messageReply: noopMessageReply });

        commandResult.shouldCheckMessage.should.be.true;
        const logs = ModDbUtils.getModLogs(serverId, targetId, ModActions.BAN);
        logs.length.should.equal(1);
        logs[0].timeout!.should.be.greaterThan(0);
    });

    it('Unknown user is reported and nothing is recorded', async (): Promise<void> => {
        memberActions.nextResult = { ok: false };
        const command = new BanCommand([targetId]);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_ERROR_COLOUR);
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        ModDbUtils.getModLogs(serverId, targetId, ModActions.BAN).length.should.equal(0);
    });
});
