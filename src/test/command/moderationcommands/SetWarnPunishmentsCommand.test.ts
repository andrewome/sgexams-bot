/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import {
    PermissionsBitField, PermissionFlagsBits, EmbedBuilder, MessageReplyOptions,
} from 'discord.js';
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { SetWarnPunishmentsCommand } from '../../../main/command/moderationcommands/SetWarnPunishmentsCommand';
import { Command } from '../../../main/command/Command';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';
import { ModerationLog } from '../../../main/modules/moderation/ModerationLog';
import { ModActions } from '../../../main/modules/moderation/classes/ModActions';

should();

const adminPerms = new PermissionsBitField([PermissionFlagsBits.Administrator]);
const { EMBED_DEFAULT_COLOUR } = Command;
const { INVALID_USAGE } = SetWarnPunishmentsCommand;

describe('SetWarnPunishmentsCommand test suite', (): void => {
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    let server: Server;
    const serverId = '69420';
    beforeEach((): void => {
        new Storage().loadServers().initNewServer(serverId);
        server = new Storage().loadServers().servers.get(serverId)!;
    });

    afterEach((): void => {
        deleteDbFile();
    });

    it('Mute with a duration is accepted', async (): Promise<void> => {
        const command = new SetWarnPunishmentsCommand(['5-mute-3d']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
        };
        const commandArgs: CommandArgs = { server, memberPerms: adminPerms, messageReply: checkEmbed };
        const commandResult = await command.execute(commandArgs);

        commandResult.shouldCheckMessage.should.be.true;
        const settings = ModerationLog.warnRules(serverId);
        settings.length.should.equal(1);
        settings[0].type.should.equal(ModActions.MUTE);
        settings[0].duration!.should.be.greaterThan(0);
    });

    it('Mute with no duration is rejected (permanent mutes are not supported)', async (): Promise<void> => {
        const command = new SetWarnPunishmentsCommand(['5-mute']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.fields![0].value.should.equals(`${INVALID_USAGE}\n${SetWarnPunishmentsCommand.COMMAND_USAGE}`);
        };
        const commandArgs: CommandArgs = { server, memberPerms: adminPerms, messageReply: checkEmbed };
        const commandResult = await command.execute(commandArgs);

        commandResult.shouldCheckMessage.should.be.true;
        ModerationLog.warnRules(serverId).length.should.equal(0);
    });

    it('Mute with a duration over 21 days is rejected', async (): Promise<void> => {
        const command = new SetWarnPunishmentsCommand(['5-mute-22d']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.fields![0].value.should.equals(`${INVALID_USAGE}\n${SetWarnPunishmentsCommand.COMMAND_USAGE}`);
        };
        const commandArgs: CommandArgs = { server, memberPerms: adminPerms, messageReply: checkEmbed };
        const commandResult = await command.execute(commandArgs);

        commandResult.shouldCheckMessage.should.be.true;
        ModerationLog.warnRules(serverId).length.should.equal(0);
    });

    it('Mute with a duration of exactly 21 days is accepted', async (): Promise<void> => {
        const command = new SetWarnPunishmentsCommand(['5-mute-21d']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
        };
        const commandArgs: CommandArgs = { server, memberPerms: adminPerms, messageReply: checkEmbed };
        const commandResult = await command.execute(commandArgs);

        commandResult.shouldCheckMessage.should.be.true;
        ModerationLog.warnRules(serverId).length.should.equal(1);
    });

    it('Ban with no duration (permanent) is still accepted', async (): Promise<void> => {
        const command = new SetWarnPunishmentsCommand(['7-ban']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
        };
        const commandArgs: CommandArgs = { server, memberPerms: adminPerms, messageReply: checkEmbed };
        const commandResult = await command.execute(commandArgs);

        commandResult.shouldCheckMessage.should.be.true;
        const settings = ModerationLog.warnRules(serverId);
        settings.length.should.equal(1);
        settings[0].type.should.equal(ModActions.BAN);
        (settings[0].duration === null).should.be.true;
    });

    it('Ban with a duration over 21 days is rejected', async (): Promise<void> => {
        const command = new SetWarnPunishmentsCommand(['7-ban-22d']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.fields![0].value.should.equals(`${INVALID_USAGE}\n${SetWarnPunishmentsCommand.COMMAND_USAGE}`);
        };
        const commandArgs: CommandArgs = { server, memberPerms: adminPerms, messageReply: checkEmbed };
        const commandResult = await command.execute(commandArgs);

        commandResult.shouldCheckMessage.should.be.true;
        ModerationLog.warnRules(serverId).length.should.equal(0);
    });

    it('Ban with a duration of exactly 21 days is accepted', async (): Promise<void> => {
        const command = new SetWarnPunishmentsCommand(['7-ban-21d']);
        const checkEmbed = (msg: MessageReplyOptions): void => {
            const embed = (msg!.embeds![0] as EmbedBuilder).data;
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
        };
        const commandArgs: CommandArgs = { server, memberPerms: adminPerms, messageReply: checkEmbed };
        const commandResult = await command.execute(commandArgs);

        commandResult.shouldCheckMessage.should.be.true;
        const settings = ModerationLog.warnRules(serverId);
        settings.length.should.equal(1);
        settings[0].type.should.equal(ModActions.BAN);
        settings[0].duration!.should.be.greaterThan(0);
    });
});
