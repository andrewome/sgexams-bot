/* eslint-disable no-unused-expressions */
import { EmbedBuilder, MessageReplyOptions } from 'discord.js';
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { MuteCommand } from '../../../main/command/moderationcommands/MuteCommand';
import { Command } from '../../../main/command/Command';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';
import { ModDbUtils } from '../../../main/modules/moderation/ModDbUtils';
import { ModActions } from '../../../main/modules/moderation/classes/ModActions';
import { FakeMemberAdapter } from '../../modules/moderation/FakeMemberAdapter';
import { baseCommandArgs } from './ModCommandTestHelper';

should();

const { EMBED_DEFAULT_COLOUR } = Command;
const { EMBED_ERROR_COLOUR } = Command;
const { DURATION_REQUIRED, DURATION_TOO_LONG } = MuteCommand;

describe('MuteCommand test suite', (): void => {
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

    it('No duration is rejected (permanent mutes are not supported)', async (): Promise<void> => {
        const command = new MuteCommand([targetId]);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.fields![0].value.should.equal(`${DURATION_REQUIRED}\n${MuteCommand.COMMAND_USAGE}`);
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });
        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(0);
    });

    it('Duration over 21 days is rejected', async (): Promise<void> => {
        const command = new MuteCommand([targetId, 'reason', '22d']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.fields![0].value.should.equal(`${DURATION_TOO_LONG}\n${MuteCommand.COMMAND_USAGE}`);
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });
        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(0);
    });

    it('Successful mute times the member out and records the action', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        const command = new MuteCommand([targetId, 'being', 'loud', '1h']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_DEFAULT_COLOUR);
            embed.fields![0].value.should.equal('Target#0001 was muted.');
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(1);
        memberActions.calls[0].method.should.equal('timeout');
        memberActions.calls[0].userId.should.equal(targetId);
        (memberActions.calls[0].args[0] as number).should.equal(60 * 60 * 1000);
        const logs = ModDbUtils.getModLogs(serverId, targetId, ModActions.MUTE);
        logs.length.should.equal(1);
        logs[0].timeout!.should.equal(60 * 60);
    });

    it('Unknown user is reported and nothing is recorded', async (): Promise<void> => {
        memberActions.nextResult = { ok: false };
        const command = new MuteCommand([targetId, '1h']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_ERROR_COLOUR);
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        ModDbUtils.getModLogs(serverId, targetId, ModActions.MUTE).length.should.equal(0);
    });
});
