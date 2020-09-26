/* eslint-disable @typescript-eslint/no-unused-vars, no-restricted-syntax, no-unused-expressions */
import { should } from 'chai';
import { MessageEmbed, Permissions } from 'discord.js';
import { Server } from '../../../main/storage/Server';
import { MsgCheckerRemoveWordCommand } from '../../../main/command/messagecheckercommands/MsgCheckerRemoveWordCommand';
import { Command } from '../../../main/command/Command';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { Storage } from '../../../main/storage/Storage';
import { deleteDbFile, TEST_STORAGE_PATH, compareWithReserialisedStorage } from '../../TestsHelper';
import { DatabaseConnection } from '../../../main/DatabaseConnection';

should();

const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { REMOVED_WORDS } = MsgCheckerRemoveWordCommand;
const { MAYBE_WORDS_NOT_INSIDE } = MsgCheckerRemoveWordCommand;
const { UNABLE_TO_REMOVE_WORDS } = MsgCheckerRemoveWordCommand;
const { NO_ARGUMENTS } = MsgCheckerRemoveWordCommand;

describe('MsgCheckerRemoveWordCommand test suite', (): void => {

    // Set storage path and remove testing.db
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Before each set up new instances
    let command: MsgCheckerRemoveWordCommand;
    let server: Server;
    let storage: Storage;
    const serverId = '69420';
    const words = ['word1', 'word2', 'word3'];
    beforeEach((): void => {
        storage = new Storage().loadServers();
        storage.initNewServer(serverId);
        server = storage.servers.get(serverId)!;
        server.messageCheckerSettings.addBannedWords(serverId, words);
    });

    afterEach((): void => {
        deleteDbFile();
    });

    it('No permission check', async (): Promise<void> => {
        command = new MsgCheckerRemoveWordCommand([]);
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

        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });

    it('Removing words, no duplicates', async (): Promise<void> => {
        const args = ['word1', 'word2', 'word3'];
        const removedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        command = new MsgCheckerRemoveWordCommand(args);

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.be.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(REMOVED_WORDS);
            field.value.should.equals(removedWordsStr);
        };

        // Execute
        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };

        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;

        // Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);
        compareWithReserialisedStorage(storage).should.be.true;
    });
    it('Removing words, with some removed already', async (): Promise<void> => {
        // Remove some words first
        const args = ['word1', 'word2', 'word3'];
        command = new MsgCheckerRemoveWordCommand(args.slice(0, 2));
        command.changeServerSettings(server);

        const unableToRemoveWordsStr = `${args[0]}\n${args[1]}\n${MAYBE_WORDS_NOT_INSIDE}`;
        const removedWordsStr = `${args[2]}\n`;

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.be.equals(2);

            const addedWordsField = embed.fields![0];
            addedWordsField.name.should.equals(REMOVED_WORDS);
            addedWordsField.value.should.equals(removedWordsStr);

            const unableToAddWordsField = embed.fields![1];
            unableToAddWordsField.name.should.equals(UNABLE_TO_REMOVE_WORDS);
            unableToAddWordsField.value.should.equals(unableToRemoveWordsStr);
        };

        // Execute
        command = new MsgCheckerRemoveWordCommand(args);
        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };
        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;

        // Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);
        compareWithReserialisedStorage(storage).should.be.true;
    });
    it('Removing words, with duplicates in args', async (): Promise<void> => {
        const args = ['word1', 'word2', 'word3', 'word3'];
        command = new MsgCheckerRemoveWordCommand(args);
        const removedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        const unableToRemoveWordsStr = `${args[3]}\n${MAYBE_WORDS_NOT_INSIDE}`;

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.be.equals(2);

            const addedWordsField = embed.fields![0];
            addedWordsField.name.should.equals(REMOVED_WORDS);
            addedWordsField.value.should.equals(removedWordsStr);

            const unableToAddWordsField = embed.fields![1];
            unableToAddWordsField.name.should.equals(UNABLE_TO_REMOVE_WORDS);
            unableToAddWordsField.value.should.equals(unableToRemoveWordsStr);
        };

        // Execute
        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };

        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;

        // Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);
    });
    it('No arguments', async (): Promise<void> => {
        const args: string[] = [];
        command = new MsgCheckerRemoveWordCommand(args);

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(ERROR_EMBED_TITLE);
            field.value.should.equals(NO_ARGUMENTS);
        };

        // Execute
        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };
        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;

        // Check if server has been updated
        server.messageCheckerSettings.getBannedWords().length.should.equals(words.length);
        compareWithReserialisedStorage(storage).should.be.true;
    });
});
