import { should } from 'chai';
import { ListCommandsCommand } from '../../main/command/generalcommands/ListCommandsCommand';
import { CommandParser } from '../../main/command/CommandParser';
import { Command } from '../../main/command/Command';
import { Server } from '../../main/storage/Server';
import { MessageCheckerSettings } from '../../main/storage/MessageCheckerSettings';
should();

const command = new ListCommandsCommand();
let EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, "");
let EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, "");
let THIS_METHOD_SHOULD_NOT_BE_CALLED = Command.THIS_METHOD_SHOULD_NOT_BE_CALLED;
let EMBED_TITLE = ListCommandsCommand.EMBED_TITLE;

describe("ListCommandsCommand test suite", () => {
    it("Embed should generate all names + description of commands inclusive of headers", () => {
        // Get output string
        let output = "";
        let commands = Array.from(CommandParser.commands);
        let descriptions = CommandParser.descriptions;
        for(let i in commands) {
            output += `**${commands[i]}**` 
            output += (descriptions[i] === "\u200b") ?
                    "\n" : ` - ${descriptions[i]}\n`;
        }

        //Compare with generated embed field.
        let embed = command.generateEmbed();

        //Check colour
        embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

        //Check field
        embed.fields!.length.should.be.equals(1);
        let field = embed.fields![0];
        field.name.should.equals(EMBED_TITLE);
        field.value.should.equals(output);
    });
    it("changeServerSettings should throw error", () => {
        try {
            command.changeServerSettings(new Server("1", new MessageCheckerSettings));
        } catch (err) {
            err.message.should.equals(THIS_METHOD_SHOULD_NOT_BE_CALLED);
        }
    });
});