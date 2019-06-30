/* eslint-disable @typescript-eslint/no-unused-vars, no-restricted-syntax */
import { should } from 'chai';
import { Server } from '../../../main/storage/Server';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { RemoveWordCommand } from '../../../main/command/messagecheckercommands/RemoveWordCommand';
import { Command } from '../../../main/command/Command';

should();

let server: Server;
let command: RemoveWordCommand;
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { REMOVED_WORDS } = RemoveWordCommand;
const { MAYBE_WORDS_NOT_INSIDE } = RemoveWordCommand;
const { UNABLE_TO_REMOVE_WORDS } = RemoveWordCommand;
const { NO_ARGUMENTS } = RemoveWordCommand;
const words = ['word1', 'word2', 'word3'];
beforeEach((): void => {
    server = new Server('123', new MessageCheckerSettings());
    for (const word of words) server.messageCheckerSettings.addbannedWord(word);
});

describe('RemoveWordCommand test suite', (): void => {
    it('Removing words, no duplicates', (): void => {
        const args = ['word1', 'word2', 'word3'];
        const removedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        const wordsRemoved: string[] = [];
        const wordsNotRemoved: string[] = [];
        command = new RemoveWordCommand(args);

        // Execute
        command.changeServerSettings(server, wordsRemoved, wordsNotRemoved);
        const embed = command.generateEmbed(wordsRemoved, wordsNotRemoved);

        // Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(1);
        const field = embed.fields![0];
        field.name.should.equals(REMOVED_WORDS);
        field.value.should.equals(removedWordsStr);
    });
    it('Removing words, with some removed already', (): void => {
        // Remove some words first
        const args = ['word1', 'word2', 'word3'];
        command = new RemoveWordCommand(args.slice(0, 2));
        command.changeServerSettings(server, [], []);

        const unableToRemoveWordsStr = `${args[0]}\n${args[1]}\n${MAYBE_WORDS_NOT_INSIDE}`;
        const removedWordsStr = `${args[2]}\n`;
        const wordsRemoved: string[] = [];
        const wordsNotRemoved: string[] = [];

        // Execute
        command = new RemoveWordCommand(args);
        command.changeServerSettings(server, wordsRemoved, wordsNotRemoved);
        const embed = command.generateEmbed(wordsRemoved, wordsNotRemoved);

        // Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(2);

        const addedWordsField = embed.fields![0];
        addedWordsField.name.should.equals(REMOVED_WORDS);
        addedWordsField.value.should.equals(removedWordsStr);

        const unableToAddWordsField = embed.fields![1];
        unableToAddWordsField.name.should.equals(UNABLE_TO_REMOVE_WORDS);
        unableToAddWordsField.value.should.equals(unableToRemoveWordsStr);
    });
    it('Removing words, with duplicates in args', (): void => {
        const args = ['word1', 'word2', 'word3', 'word3'];
        command = new RemoveWordCommand(args);
        const removedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        const unableToRemoveWordsStr = `${args[3]}\n${MAYBE_WORDS_NOT_INSIDE}`;
        const wordsRemoved: string[] = [];
        const wordsNotRemoved: string[] = [];

        // Execute
        command.changeServerSettings(server, wordsRemoved, wordsNotRemoved);
        const embed = command.generateEmbed(wordsRemoved, wordsNotRemoved);

        // Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(2);

        const addedWordsField = embed.fields![0];
        addedWordsField.name.should.equals(REMOVED_WORDS);
        addedWordsField.value.should.equals(removedWordsStr);

        const unableToAddWordsField = embed.fields![1];
        unableToAddWordsField.name.should.equals(UNABLE_TO_REMOVE_WORDS);
        unableToAddWordsField.value.should.equals(unableToRemoveWordsStr);
    });
    it('No arguments', (): void => {
        const args: string[] = [];
        command = new RemoveWordCommand(args);

        // Execute
        command.changeServerSettings(server, [], []);
        const embed = command.generateEmbed([], []);

        // Check if server has been updated
        server.messageCheckerSettings.getBannedWords().length.should.equals(words.length);

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
        embed.fields!.length.should.be.equals(1);

        const field = embed.fields![0];
        field.name.should.equals(ERROR_EMBED_TITLE);
        field.value.should.equals(NO_ARGUMENTS);
    });
});
