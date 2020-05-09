/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { MessageEmbed, Permissions } from 'discord.js';
import { MsgCheckerSetDeleteMessageCommand } from '../../../main/command/messagecheckercommands/MsgCheckerSetDeleteMessageCommand';
import { Command } from '../../../main/command/Command';
import { Server } from '../../../main/storage/Server';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { deleteDbFile, TEST_STORAGE_PATH, compareWithReserialisedStorage } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';

should();

const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { INCORRECT_FORMAT } = MsgCheckerSetDeleteMessageCommand;
const { EMBED_TITLE } = MsgCheckerSetDeleteMessageCommand;
const { BOOL_CANNOT_BE_UNDEFINED } = MsgCheckerSetDeleteMessageCommand;

describe('MsgCheckerSetDeleteMessageCommand test suite', (): void => {

    // Set storage path and remove testing.db
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Before each set up new instances
    let server: Server;
    let command: MsgCheckerSetDeleteMessageCommand;
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
        command = new MsgCheckerSetDeleteMessageCommand([]);
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
    it('No arguments', (): void => {
        command = new MsgCheckerSetDeleteMessageCommand([]);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NO_ARGUMENTS);
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
    it('Wrong format', (): void => {
        command = new MsgCheckerSetDeleteMessageCommand(['something']);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(INCORRECT_FORMAT);
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

    it('Correct format, true', (): void => {
        command = new MsgCheckerSetDeleteMessageCommand(['true']);
        const msg = 'Delete Message set to: **TRUE**';

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
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
        const commandResult = command.execute(commandArgs);

        // Check server settings, should be true
        server.messageCheckerSettings.getDeleteMessage().should.be.true;
        compareWithReserialisedStorage(storage).should.be.true;

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Correct format, true all caps', (): void => {
        command = new MsgCheckerSetDeleteMessageCommand(['TRUE']);
        const msg = 'Delete Message set to: **TRUE**';

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
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
        const commandResult = command.execute(commandArgs);

        // Check server settings, should be true
        server.messageCheckerSettings.getDeleteMessage().should.be.true;
        compareWithReserialisedStorage(storage).should.be.true;

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Correct format, true mixed caps', (): void => {
        command = new MsgCheckerSetDeleteMessageCommand(['TRuE']);
        const msg = 'Delete Message set to: **TRUE**';

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
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
        const commandResult = command.execute(commandArgs);

        // Check server settings, should be true
        server.messageCheckerSettings.getDeleteMessage().should.be.true;
        compareWithReserialisedStorage(storage).should.be.true;

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Correct format, false', (): void => {
        command = new MsgCheckerSetDeleteMessageCommand(['false']);
        const msg = 'Delete Message set to: **FALSE**';

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        // Check server settings, should be true
        server.messageCheckerSettings.getDeleteMessage().should.be.false;

        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };
        const commandResult = command.execute(commandArgs);

        // Check server settings, should be false
        server.messageCheckerSettings.getDeleteMessage().should.be.false;
        compareWithReserialisedStorage(storage).should.be.true;

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
});
