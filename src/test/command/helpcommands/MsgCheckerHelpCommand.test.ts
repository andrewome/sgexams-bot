/* eslint-disable no-unused-expressions */
import { should } from 'chai';
import { RichEmbed, Permissions } from 'discord.js';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { CommandNamesAndDescriptions } from '../../../main/command/classes/CommandNamesAndDescriptions';
import { MsgCheckerHelpCommand } from '../../../main/command/helpcommands/MsgCheckerHelpCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
const command = new MsgCheckerHelpCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const { HEADER } = MsgCheckerHelpCommand;
beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
);
});

describe('MsgCheckerHelp Command Test Suite', (): void => {
    it('Execute test', (): void => {
        const checkEmbed = (embed: RichEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(HEADER);

            // Check field value
            let output = '';
            const { MSGCHECKER_COMMANDS, MSGCHECKER_DESCRIPTIONS } = CommandNamesAndDescriptions;
            for (let i = 0; i < MSGCHECKER_COMMANDS.length; i++) {
                output += `**${MSGCHECKER_COMMANDS[i]}** - ${MSGCHECKER_DESCRIPTIONS[i]}\n`;
            }
            field.value.should.equals(output);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
});
