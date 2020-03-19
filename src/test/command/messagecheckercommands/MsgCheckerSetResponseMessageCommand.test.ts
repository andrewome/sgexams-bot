/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
 MessageEmbed, Permissions, Channel, Collection, Client,
} from 'discord.js';
import { MsgCheckerSetResponseMessageCommand } from '../../../main/command/messagecheckercommands/MsgCheckerSetResponseMessageCommand';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
let command: MsgCheckerSetResponseMessageCommand;
const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { MESSAGE_RESETTED } = MsgCheckerSetResponseMessageCommand;
const { EMBED_TITLE } = MsgCheckerSetResponseMessageCommand;
const { RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED } = MsgCheckerSetResponseMessageCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
);
});

describe('MsgCheckerSetResponseMessageCommand test suite', (): void => {
    it('No permission check', (): void => {
        command = new MsgCheckerSetResponseMessageCommand([]);
        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Reset response message', (): void => {
        command = new MsgCheckerSetResponseMessageCommand([]);
        server.messageCheckerSettings.setResponseMessage('XD');

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(MESSAGE_RESETTED);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        (server.messageCheckerSettings.getResponseMessage() === null).should.be.true;
    });
    it('Valid channelid', (): void => {
        const responseMessage = 'Hey there';
        const msg = `Response Message set to ${responseMessage}`;
        command = new MsgCheckerSetResponseMessageCommand(responseMessage.split(' '));

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        server.messageCheckerSettings.getResponseMessage()!.should.equals(responseMessage);
    });
});
