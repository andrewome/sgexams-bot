/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-expressions */
import { should } from 'chai';
import { Permissions, MessageEmbed } from 'discord.js';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { StarboardGetThresholdCommand } from '../../../main/command/starboardcommands/StarboardGetThresholdCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';

should();

const adminPerms = new Permissions(['ADMINISTRATOR']);
const { EMBED_DEFAULT_COLOUR } = Command;
const { EMBED_ERROR_COLOUR } = Command;
const { THRESHOLD_NOT_SET } = StarboardGetThresholdCommand;
const { EMBED_TITLE } = StarboardGetThresholdCommand;

describe('GetStarboardChannelCommand class test suite', (): void => {
    // Set storage path and remove testing.db
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Before each set up new instances
    const command = new StarboardGetThresholdCommand();
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
        const checkEmbed = (embed: MessageEmbed): void => {
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
    it('Threshold not set', async (): Promise<void> => {
        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(THRESHOLD_NOT_SET);
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

    it('Threshold set', async (): Promise<void> => {
        const threshold = 10;
        server.starboardSettings.setThreshold(serverId, threshold);

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(`The emoji threshold is currently ${threshold}.`);
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
