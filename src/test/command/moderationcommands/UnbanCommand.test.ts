/* eslint-disable no-unused-expressions */
import { EmbedBuilder, MessageReplyOptions } from 'discord.js';
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { UnbanCommand } from '../../../main/command/moderationcommands/UnbanCommand';
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

describe('UnbanCommand test suite', (): void => {
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

    it('Successful unban records the action', async (): Promise<void> => {
        memberActions.nextResult = { ok: true, tag: 'Target#0001' };
        const command = new UnbanCommand([targetId, 'served', 'their', 'time']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_DEFAULT_COLOUR);
            embed.fields![0].value.should.equal('Target#0001 was unbanned.');
            embed.fields![1].value.should.equal('served their time');
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        memberActions.calls.length.should.equal(1);
        memberActions.calls[0].method.should.equal('unban');
        memberActions.calls[0].userId.should.equal(targetId);
        const logs = ModDbUtils.getModLogs(serverId, targetId, ModActions.UNBAN);
        logs.length.should.equal(1);
    });

    it('Unknown user is reported and nothing is recorded', async (): Promise<void> => {
        memberActions.nextResult = { ok: false };
        const command = new UnbanCommand([targetId]);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equal(EMBED_ERROR_COLOUR);
        };
        const commandResult = await command.execute({ ...baseArgs(), messageReply: checkEmbed });

        commandResult.shouldCheckMessage.should.be.true;
        ModDbUtils.getModLogs(serverId, targetId, ModActions.UNBAN).length.should.equal(0);
    });
});
