/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-expressions, max-len */
import { should } from 'chai';
import { Permissions, MessageEmbed, MessageOptions } from 'discord.js';
import { MsgCheckerGetReportChannelCommand } from '../../../main/command/messagecheckercommands/MsgCheckerGetReportChannelCommand';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { deleteDbFile, TEST_STORAGE_PATH, compareWithReserialisedStorage } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';

should();

const adminPerms = new Permissions(['ADMINISTRATOR']);
const { EMBED_DEFAULT_COLOUR } = Command;
const { EMBED_ERROR_COLOUR } = Command;
const { CHANNEL_NOT_SET } = MsgCheckerGetReportChannelCommand;
const { EMBED_TITLE } = MsgCheckerGetReportChannelCommand;

describe('MsgCheckerGetReportChannelCommand class test suite', (): void => {
    // Set storage path and remove testing.db
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Before each set up new instances
    const command = new MsgCheckerGetReportChannelCommand();
    let server: Server;
    let storage: Storage;
    const serverId = '69420';
    beforeEach((): void => {
        storage = new Storage().loadServers();
        storage.initNewServer(serverId);
        server = storage.servers.get(serverId)!;
    });

    afterEach((): void => {
        deleteDbFile();
    });

    it('No permission check', async (): Promise<void> => {
        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
            embed.color!.should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: new Permissions([]),
            messageReply: checkEmbed,
        };

        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Channel not set', async (): Promise<void> => {
        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
            // Check embed
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_NOT_SET);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };

        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Channel set', async (): Promise<void> => {
        const channelId = '111';
        server.messageCheckerSettings.setReportingChannelId(
            server.serverId,
            channelId,
        );

        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
            // Check embed
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(`Reporting Channel is currently set to <#${channelId}>.`);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };
        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
});
