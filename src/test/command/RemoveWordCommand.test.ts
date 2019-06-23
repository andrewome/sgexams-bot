import { should } from "chai";
import { Server } from "../../main/storage/Server";
import { MessageCheckerSettings } from "../../main/storage/MessageCheckerSettings";
import { RemoveWordCommand } from "../../main/command/messagecheckercommands/RemoveWordCommand";
import { Command } from "../../main/command/Command";
should();

let server: Server;
let command: RemoveWordCommand;
let EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, "");
let EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, "");
let ERROR_EMBED_TITLE = Command.ERROR_EMBED_TITLE;
let THIS_METHOD_SHOULD_NOT_BE_CALLED = Command.THIS_METHOD_SHOULD_NOT_BE_CALLED;
let REMOVED_WORDS = RemoveWordCommand.REMOVED_WORDS
let MAYBE_WORDS_NOT_INSIDE = RemoveWordCommand.MAYBE_WORDS_NOT_INSIDE;
let UNABLE_TO_REMOVE_WORDS = RemoveWordCommand.UNABLE_TO_REMOVE_WORDS;
let NO_ARGUMENTS = RemoveWordCommand.NO_ARGUMENTS;
let words = ["word1", "word2", "word3"];
beforeEach(() => {
    server = new Server("123", new MessageCheckerSettings());
    for(let word of words)
        server.messageCheckerSettings.addbannedWord(word);
});

describe("RemoveWordCommand test suite", () => {
    it("Removing words, no duplicates", () => {
        let args = ["word1", "word2", "word3"];
        let removedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        let wordsRemoved: string[] = [];
        let wordsNotRemoved: string[] = [];
        command = new RemoveWordCommand(args);

        //Execute
        command.changeServerSettings(server, wordsRemoved, wordsNotRemoved);
        const embed = command.generateEmbed(wordsRemoved, wordsNotRemoved);

        //Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);

        //Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(1);
        const field = embed.fields![0];
        field.name.should.equals(REMOVED_WORDS);
        field.value.should.equals(removedWordsStr);
    });
    it("Removing words, with some removed already", () => {
        //Remove some words first
        let args = ["word1", "word2", "word3"];
        command = new RemoveWordCommand(args.slice(0, 2));
        command.changeServerSettings(server, [], []);

        let unableToRemoveWordsStr = `${args[0]}\n${args[1]}\n${MAYBE_WORDS_NOT_INSIDE}`;
        let removedWordsStr = `${args[2]}\n`;
        let wordsRemoved: string[] = [];
        let wordsNotRemoved: string[] = [];
        
        //Execute
        command = new RemoveWordCommand(args);
        command.changeServerSettings(server, wordsRemoved, wordsNotRemoved);
        const embed = command.generateEmbed(wordsRemoved, wordsNotRemoved);

        //Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);

        //Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(2);

        const addedWordsField = embed.fields![0];
        addedWordsField.name.should.equals(REMOVED_WORDS);
        addedWordsField.value.should.equals(removedWordsStr);

        const unableToAddWordsField = embed.fields![1];
        unableToAddWordsField.name.should.equals(UNABLE_TO_REMOVE_WORDS);
        unableToAddWordsField.value.should.equals(unableToRemoveWordsStr);
    });
    it("Removing words, with duplicates in args", () => {
        let args = ["word1", "word2", "word3", "word3"];
        command = new RemoveWordCommand(args);
        let removedWordsStr = `${args[0]}\n${args[1]}\n${args[2]}\n`;
        let unableToRemoveWordsStr = `${args[3]}\n${MAYBE_WORDS_NOT_INSIDE}`;
        let wordsRemoved: string[] = [];
        let wordsNotRemoved: string[] = [];
        
        //Execute
        command.changeServerSettings(server, wordsRemoved, wordsNotRemoved);
        const embed = command.generateEmbed(wordsRemoved, wordsNotRemoved);

        //Check if server has been updated
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.length.should.equal(0);

        //Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.be.equals(2);

        const addedWordsField = embed.fields![0];
        addedWordsField.name.should.equals(REMOVED_WORDS);
        addedWordsField.value.should.equals(removedWordsStr);
        
        const unableToAddWordsField = embed.fields![1];
        unableToAddWordsField.name.should.equals(UNABLE_TO_REMOVE_WORDS);
        unableToAddWordsField.value.should.equals(unableToRemoveWordsStr);
    });
    it("No arguments", () => {
        let args: string[] = [];
        command = new RemoveWordCommand(args);

        //Execute
        command.changeServerSettings(server, [], []);
        const embed = command.generateEmbed([], []);

        //Check if server has been updated
        server.messageCheckerSettings.getBannedWords().length.should.equals(words.length);

        //Check embed
        embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
        embed.fields!.length.should.be.equals(1);

        const field = embed.fields![0];
        field.name.should.equals(ERROR_EMBED_TITLE);
        field.value.should.equals(NO_ARGUMENTS);
    });
});