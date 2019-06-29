/* eslint-disable @typescript-eslint/no-unused-vars */
import { should } from 'chai';
import { ListCommandsCommand } from '../../../main/command/generalcommands/ListCommandsCommand';
import { CommandParser } from '../../../main/command/CommandParser';
import { Command } from '../../../main/command/Command';
import { Server } from '../../../main/storage/Server';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';

should();

const command = new ListCommandsCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { EMBED_TITLE } = ListCommandsCommand;

describe('ListCommandsCommand test suite', (): void => {
    it('Embed should generate all names + description of commands inclusive of headers', (): void => {
        // Get output string
        let output = '';
        const commands = Array.from(CommandParser.commands);
        const { descriptions } = CommandParser;
        for (const i in commands) {
            output += `**${commands[i]}**`;
            output += (descriptions[i] === '\u200b')
                ? '\n' : ` - ${descriptions[i]}\n`;
        }

        // Compare with generated embed field.
        const embed = command.generateEmbed();

        // Check colour
        embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

        // Check field
        embed.fields!.length.should.be.equals(1);
        const field = embed.fields![0];
        field.name.should.equals(EMBED_TITLE);
        field.value.should.equals(output);
    });
    it('changeServerSettings should throw error', (): void => {
        try {
            command.changeServerSettings(new Server('1', new MessageCheckerSettings()));
        } catch (err) {
            err.message.should.equals(THIS_METHOD_SHOULD_NOT_BE_CALLED);
        }
    });
});
