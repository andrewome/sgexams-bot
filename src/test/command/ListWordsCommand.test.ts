import { should } from 'chai';
import { ListWordsCommand } from '../../main/command/messagecheckercommands/ListWordsCommand';
import { Command } from '../../main/command/Command';
import { Server } from '../../main/storage/Server';
import { MessageCheckerSettings } from '../../main/storage/MessageCheckerSettings';
should();

const command = new ListWordsCommand();
let server: Server;
let EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, "");
let EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, "");
let THIS_METHOD_SHOULD_NOT_BE_CALLED = Command.THIS_METHOD_SHOULD_NOT_BE_CALLED;
let EMBED_TITLE = ListWordsCommand.EMBED_TITLE;
let NO_WORDS_FOUND = ListWordsCommand.NO_WORDS_FOUND;

beforeEach(() => {
    server = new Server("123", new MessageCheckerSettings());
});

describe("ListCommandsCommand test suite", () => {
    it("Embed should show all bannedWords", () => {
        // Set banned words
        let bannedWords = ["word1", "word2", "word3"];
        for(let word of bannedWords) {
            server.messageCheckerSettings.addbannedWord(word);
        }

        // Get output string
        let output = "";
        for(let word of bannedWords) {
            output += word + "\n";
        }

        //Compare with generated embed field.
        let embed = command.generateEmbed(server);

        //Check colour
        embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

        //Check field
        embed.fields!.length.should.be.equals(1);
        let field = embed.fields![0];
        field.name.should.equals(EMBED_TITLE);
        field.value.should.equals(output);
    });
    it("Embed should show if no bannedWords", () => {
        //Compare with generated embed field.
        let embed = command.generateEmbed(server);

        //Check colour
        embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

        //Check field
        embed.fields!.length.should.be.equals(1);
        let field = embed.fields![0];
        field.name.should.equals(EMBED_TITLE);
        field.value.should.equals(NO_WORDS_FOUND);
    });
    it("changeServerSettings should throw error", () => {
        try {
            command.changeServerSettings(server);
        } catch (err) {
            err.message.should.equals(THIS_METHOD_SHOULD_NOT_BE_CALLED);
        }
    });
});