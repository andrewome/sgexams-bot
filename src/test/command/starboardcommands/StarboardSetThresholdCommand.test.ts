/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
    MessageEmbed, Permissions, Collection, Channel, Client,
} from 'discord.js';
import { Command } from '../../../main/command/Command';
import { Server } from '../../../main/storage/Server';
import { StarboardSetThresholdCommand } from '../../../main/command/starboardcommands/StarboardSetThresholdCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { deleteDbFile, TEST_STORAGE_PATH, compareWithReserialisedStorage } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';

should();

const adminPerms = new Permissions(['ADMINISTRATOR']);
const { EMBED_DEFAULT_COLOUR } = Command;
const { EMBED_ERROR_COLOUR } = Command;
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { EMBED_TITLE } = StarboardSetThresholdCommand;
const { THRESHOLD_RESETTED } = StarboardSetThresholdCommand;
const { THRESHOLD_CANNOT_BE_UNDEFINED } = StarboardSetThresholdCommand;
const { NOT_AN_INTEGER } = StarboardSetThresholdCommand;

describe('StarboardSetThresholdCommand test suite', (): void => {
    // Set storage path and remove testing.db
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Before each set up new instances
    let command: StarboardSetThresholdCommand;
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
        command = new StarboardSetThresholdCommand([]);
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

    it('Reset threshold', async (): Promise<void> => {
        const threshold = 10;
        server.starboardSettings.setThreshold(serverId, threshold);
        command = new StarboardSetThresholdCommand([]);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(THRESHOLD_RESETTED);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };
        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;

        // Check server
        (server.starboardSettings.getThreshold() === null).should.be.true;
        compareWithReserialisedStorage(storage).should.be.true;
    });
    it('Valid threshold', async (): Promise<void> => {
        const threshold = 10;
        const msg = `Starboard threshold set to ${threshold}.`;
        command = new StarboardSetThresholdCommand([threshold.toString(10)]);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };
        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;

        // Check server
        server.starboardSettings.getThreshold()!.should.equals(threshold);
        compareWithReserialisedStorage(storage).should.be.true;
    });
    it('Invalid threshold - String', async (): Promise<void> => {
        command = new StarboardSetThresholdCommand(['haha']);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_AN_INTEGER);
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
    it('Invalid threshold - Out of range value 1', async (): Promise<void> => {
        command = new StarboardSetThresholdCommand(['0']);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_AN_INTEGER);
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
    it('Invalid threshold - Out of range value 2', async (): Promise<void> => {
        command = new StarboardSetThresholdCommand(['-5']);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_AN_INTEGER);
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
