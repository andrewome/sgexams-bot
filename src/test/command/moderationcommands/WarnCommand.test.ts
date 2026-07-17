/* eslint-disable no-unused-expressions */
import { EmbedBuilder, MessageReplyOptions, GuildMemberManager } from 'discord.js';
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { WarnCommand } from '../../../main/command/moderationcommands/WarnCommand';
import { Command } from '../../../main/command/Command';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';
import { ModerationLog } from '../../../main/modules/moderation/ModerationLog';
import { ModActions } from '../../../main/modules/moderation/classes/ModActions';
import { FakeMemberAdapter } from '../../modules/moderation/FakeMemberAdapter';
import { baseCommandArgs, noopMessageReply } from './ModCommandTestHelper';

should();

const { EMBED_DEFAULT_COLOUR } = Command;
const { EMBED_ERROR_COLOUR } = Command;

describe('WarnCommand test suite', (): void => {
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

    it('Plain warn looks the user up and records the action, no escalation', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        const command = new WarnCommand([targetId, 'first', 'offence']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_DEFAULT_COLOUR);
            embed.fields![0].value.should.equal('Target#0001 was warned.');
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(1);
        memberActions.calls[0].method.should.equal('lookup');
        ModerationLog.entries(serverId, { userId: targetId, type: ModActions.WARN }).length.should.equal(1);
    });

    it('Unknown user is reported and nothing is recorded', async (): Promise<void> => {
        memberActions.nextResult = { ok: false };
        const command = new WarnCommand([targetId]);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_ERROR_COLOUR);
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        ModerationLog.entries(serverId, { userId: targetId, type: ModActions.WARN }).length.should.equal(0);
    });

    it('Warn threshold escalates to a permanent ban', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        ModerationLog.setWarnRule(serverId, 1, ModActions.BAN, null);
        const command = new WarnCommand([targetId, 'final', 'straw']);
        const commandResult = await command.execute({ ...baseArgs(), messageReply: noopMessageReply });

        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(2);
        memberActions.calls[0].method.should.equal('lookup');
        memberActions.calls[1].method.should.equal('ban');
        memberActions.calls[1].userId.should.equal(targetId);
        ModerationLog.entries(serverId, { userId: targetId, type: ModActions.BAN }).length.should.equal(1);
    });

    it('Warn threshold escalates to a temporary ban and schedules its unban', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        ModerationLog.setWarnRule(serverId, 1, ModActions.BAN, 3600);
        const command = new WarnCommand([targetId, 'final', 'straw']);
        // members is only closed over for the eventual auto-unban timer, never called
        // synchronously - a stub is enough to exercise this path without a real manager.
        const members = {} as GuildMemberManager;
        const commandResult = await command.execute({ ...baseArgs(), members, messageReply: noopMessageReply });

        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls[1].method.should.equal('ban');
        const logs = ModerationLog.entries(serverId, { userId: targetId, type: ModActions.BAN });
        logs.length.should.equal(1);
        logs[0].timeout!.should.equal(3600);
    });

    it('Warn threshold escalates to a timed mute', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        ModerationLog.setWarnRule(serverId, 1, ModActions.MUTE, 3600);
        const command = new WarnCommand([targetId, 'final', 'straw']);
        const commandResult = await command.execute({ ...baseArgs(), messageReply: noopMessageReply });

        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(2);
        memberActions.calls[1].method.should.equal('timeout');
        (memberActions.calls[1].args[0] as number).should.equal(3600 * 1000);
        ModerationLog.entries(serverId, { userId: targetId, type: ModActions.MUTE }).length.should.equal(1);
    });
});
