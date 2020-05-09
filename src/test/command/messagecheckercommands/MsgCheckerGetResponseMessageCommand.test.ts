/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-expressions */
import { should } from 'chai';
import { MessageEmbed, Permissions } from 'discord.js';
import { MsgCheckerGetResponseMessageCommand } from '../../../main/command/messagecheckercommands/MsgCheckerGetResponseMessageCommand';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { CHANNEL_NOT_SET } = MsgCheckerGetResponseMessageCommand;
const { EMBED_TITLE } = MsgCheckerGetResponseMessageCommand;

describe('MsgCheckerGetResponseMessageCommand class test suite', (): void => {
    // Set storage path and remove testing.db
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Before each set up new instances
    const command = new MsgCheckerGetResponseMessageCommand();
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

    it('No permission check', (): void => {
        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(Command.EMBED_ERROR_COLOUR);
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

        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Message not set', (): void => {
        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
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

        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });

    it('Message set', (): void => {
        const responseMessage = 'testing';
        server.messageCheckerSettings.setResponseMessage(
            server.serverId,
            responseMessage,
        );

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(`Response message is ${responseMessage}.`);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
});
