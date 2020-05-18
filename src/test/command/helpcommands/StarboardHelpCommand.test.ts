/* eslint-disable no-unused-expressions */
import { should } from 'chai';
import { MessageEmbed, Permissions } from 'discord.js';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { CommandNamesAndDescriptions } from '../../../main/command/classes/CommandNamesAndDescriptions';
import { StarboardHelpCommand } from '../../../main/command/helpcommands/StarboardHelpCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
const command = new StarboardHelpCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const { HEADER } = StarboardHelpCommand;
beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
    );
});

describe('StarboardHelp Command Test Suite', (): void => {
    it('Execute test', async (): Promise<void> => {
        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(HEADER);

            // Check field value
            let output = '';
            const { STARBOARD_COMMANDS, STARBOARD_DESCRIPTIONS } = CommandNamesAndDescriptions;
            for (let i = 0; i < STARBOARD_COMMANDS.length; i++) {
                output += `**${STARBOARD_COMMANDS[i]}** - ${STARBOARD_DESCRIPTIONS[i]}\n`;
            }
            field.value.should.equals(output);
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
});
