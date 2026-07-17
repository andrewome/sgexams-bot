/* eslint-disable no-unused-expressions */
import { EmbedBuilder, MessageReplyOptions } from 'discord.js';
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { KickCommand } from '../../../main/command/moderationcommands/KickCommand';
import { Command } from '../../../main/command/Command';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';
import { ModerationLog } from '../../../main/modules/moderation/ModerationLog';
import { ModActions } from '../../../main/modules/moderation/classes/ModActions';
import { FakeMemberAdapter } from '../../modules/moderation/FakeMemberAdapter';
import { baseCommandArgs } from './ModCommandTestHelper';

should();

const { EMBED_DEFAULT_COLOUR } = Command;
const { EMBED_ERROR_COLOUR } = Command;

describe('KickCommand test suite', (): void => {
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

    it('Successful kick records the action', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        const command = new KickCommand([targetId, 'get', 'out']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_DEFAULT_COLOUR);
            embed.fields![0].value.should.equal('Target#0001 was kicked.');
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(2);
        memberActions.calls[0].method.should.equal('kick');
        memberActions.calls[0].userId.should.equal(targetId);
        memberActions.calls[1].method.should.equal('dm');
        memberActions.calls[1].userId.should.equal(targetId);
        ModerationLog.entries(serverId, { userId: targetId, type: ModActions.KICK }).length.should.equal(1);
    });

    it('DM failure does not block the kick, and is noted on the confirmation embed', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        memberActions.nextDmResult = { ok: false };
        const command = new KickCommand([targetId, 'get', 'out']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.fields![2].name.should.equal('Notified');
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        ModerationLog.entries(serverId, { userId: targetId, type: ModActions.KICK }).length.should.equal(1);
    });

    it('Unknown user is reported and nothing is recorded', async (): Promise<void> => {
        memberActions.nextResult = { ok: false };
        const command = new KickCommand([targetId]);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_ERROR_COLOUR);
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        ModerationLog.entries(serverId, { userId: targetId, type: ModActions.KICK }).length.should.equal(0);
    });
});
