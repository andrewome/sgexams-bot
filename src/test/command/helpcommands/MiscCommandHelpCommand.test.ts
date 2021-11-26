/* eslint-disable no-unused-expressions */
import { should } from 'chai';
import { MessageOptions, Permissions } from 'discord.js';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { CommandCollection } from '../../../main/command/classes/CommandCollection';
import { MiscCommandHelpCommand } from '../../../main/command/helpcommands/MiscCommandHelpCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
const command = new MiscCommandHelpCommand();
const { EMBED_DEFAULT_COLOUR } = Command;
const { HEADER } = MiscCommandHelpCommand;
beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
    );
});

describe('MiscHelp Command Test Suite', (): void => {
    it('Execute test', async (): Promise<void> => {
        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
            // Check embed
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(HEADER);

            // Check field value
            const output = CommandCollection.MISC_COMMANDS.map(
                (cmd) => `**${cmd.NAME}** - ${cmd.DESCRIPTION}`,
            ).join('\n');
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
