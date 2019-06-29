/* eslint-disable @typescript-eslint/no-unused-vars */
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { AddWordCommand } from '../../../main/command/messagecheckercommands/AddWordCommand';
import { Command } from '../../../main/command/Command';

should();

let server: Server;
let command: AddWordCommand;
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { ADDED_WORDS } = AddWordCommand;
const { MAYBE_WORDS_ALREADY_ADDED } = AddWordCommand;
const { UNABLE_TO_ADD_WORDS } = AddWordCommand;

beforeEach((): void => {
    server = new Server('123', new MessageCheckerSettings());
});

describe('AddWordCommand test suite', (): void => {
    it('Adding words, no duplicates', (): void => {
        // Add some words
        const args = ['word1', 'word2', 'word3'];
        const addedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        const wordsAdded: string[] = [];
        const wordsNotAdded: string[] = [];
        command = new AddWordCommand(args);

        // Execute
        command.changeServerSettings(server, wordsAdded, wordsNotAdded);
        const embed = command.generateEmbed(wordsAdded, wordsNotAdded);

        // Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(args.length);
        bannedWords.includes(args[0]).should.be.true;
        bannedWords.includes(args[1]).should.be.true;
        bannedWords.includes(args[2]).should.be.true;

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(1);
        const field = embed.fields![0];
        field.name.should.equals(ADDED_WORDS);
        field.value.should.equals(addedWordsStr);
    });
    it('Adding words, with duplicates', (): void => {
        // Add some words first
        const args = ['word1', 'word2', 'word3'];
        command = new AddWordCommand(args.slice(0, 2));
        command.changeServerSettings(server, [], []);

        const unableToAddWordsStr = `${args[0]}\n${args[1]}\n${MAYBE_WORDS_ALREADY_ADDED}`;
        const addedWordsStr = `${args[2]}\n`;
        const wordsAdded: string[] = [];
        const wordsNotAdded: string[] = [];

        // Execute
        command = new AddWordCommand(args);
        command.changeServerSettings(server, wordsAdded, wordsNotAdded);
        const embed = command.generateEmbed(wordsAdded, wordsNotAdded);

        // Check if server has been updated, no duplicates inside
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(args.length);
        bannedWords.includes(args[0]).should.be.true;
        bannedWords.includes(args[1]).should.be.true;
        bannedWords.includes(args[2]).should.be.true;

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(2);

        const addedWordsField = embed.fields![0];
        addedWordsField.name.should.equals(ADDED_WORDS);
        addedWordsField.value.should.equals(addedWordsStr);

        const unableToAddWordsField = embed.fields![1];
        unableToAddWordsField.name.should.equals(UNABLE_TO_ADD_WORDS);
        unableToAddWordsField.value.should.equals(unableToAddWordsStr);
    });
    it('Adding words, with duplicates in args', (): void => {
        // Add some words first
        const args = ['word1', 'word2', 'word3', 'word3'];
        command = new AddWordCommand(args);
        const addedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        const unableToAddWordsStr = `${args[3]}\n${MAYBE_WORDS_ALREADY_ADDED}`;
        const wordsAdded: string[] = [];
        const wordsNotAdded: string[] = [];

        // Execute
        command.changeServerSettings(server, wordsAdded, wordsNotAdded);
        const embed = command.generateEmbed(wordsAdded, wordsNotAdded);

        // Check if server has been updated, no duplicates inside
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(args.length - 1);
        bannedWords.includes(args[0]).should.be.true;
        bannedWords.includes(args[1]).should.be.true;
        bannedWords.includes(args[2]).should.be.true;

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(2);

        const addedWordsField = embed.fields![0];
        addedWordsField.name.should.equals(ADDED_WORDS);
        addedWordsField.value.should.equals(addedWordsStr);

        const unableToAddWordsField = embed.fields![1];
        unableToAddWordsField.name.should.equals(UNABLE_TO_ADD_WORDS);
        unableToAddWordsField.value.should.equals(unableToAddWordsStr);
    });
    it('No arguments', (): void => {
        const args: string[] = [];
        command = new AddWordCommand(args);

        // Execute
        command.changeServerSettings(server, [], []);
        const embed = command.generateEmbed([], []);

        // Check if server has been updated
        server.messageCheckerSettings.getBannedWords().length.should.equals(0);

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
        embed.fields!.length.should.be.equals(1);

        const field = embed.fields![0];
        field.name.should.equals(ERROR_EMBED_TITLE);
        field.value.should.equals(NO_ARGUMENTS);
    });
});
