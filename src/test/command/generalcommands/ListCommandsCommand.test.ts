/* eslint-disable @typescript-eslint/no-unused-vars, guard-for-in, no-restricted-syntax */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { Permissions, RichEmbed } from 'discord.js';
import { ListCommandsCommand } from '../../../main/command/helpcommands/ListCommandsCommand';
import { CommandParser } from '../../../main/command/CommandParser';
import { Command } from '../../../main/command/Command';
import { Server } from '../../../main/storage/Server';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';

should();

const command = new ListCommandsCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const server = new Server('test', new MessageCheckerSettings(), new StarboardSettings(null, null, null));
const adminPerms = new Permissions(['ADMINISTRATOR']);

describe('ListCommandsCommand test suite', (): void => {
    it('Embed should generate all names + description of commands inclusive of headers', (): void => {
        // Get output embed
        let output = '';
        const fields: [string, string][] = [];
        const commands = Array.from(CommandParser.commands);
        let curTitle = commands[0];
        for (let i = 0; i < commands.length; i++) {
            if (CommandParser.descriptions[i] === CommandParser.EMPTY_STRING) {
                if (output !== '') fields.push([curTitle, output]);
                curTitle = commands[i];
                output = '';
            } else {
                output += (CommandParser.descriptions[i] !== CommandParser.EMPTY_STRING)
                          ? `**${commands[i]}** - ${CommandParser.descriptions[i]}\n`
                          : '\n';
            }
        }
        fields.push([curTitle, output]);

        // Compare with generated embed field.
        const checkEmbed = (embed: RichEmbed): void => {
            // Check colour
            embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

            // Check fields
            embed.fields!.length.should.be.equals(fields.length);
            for (let i = 0; i < embed.fields!.length; i++) {
                embed.fields![i].name.should.equals(fields[i][0]);
                embed.fields![i].value.should.equals(fields[i][1]);
            }
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
});
