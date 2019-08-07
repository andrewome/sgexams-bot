/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
 RichEmbed, Permissions, Channel, Collection, Client,
} from 'discord.js';
import { SetResponseMessageCommand, ResponseType } from '../../../main/command/messagecheckercommands/SetResponseMessageCommand';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';

should();

let server: Server;
let command: SetResponseMessageCommand;
const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { MESSAGE_RESETTED } = SetResponseMessageCommand;
const { EMBED_TITLE } = SetResponseMessageCommand;
const { RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED } = SetResponseMessageCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('SetResponseMessageCommand test suite', (): void => {
    it('Reset response message', (): void => {
        command = new SetResponseMessageCommand([]);
        server.messageCheckerSettings.setResponseMessage('XD');

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(MESSAGE_RESETTED);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        (server.messageCheckerSettings.getResponseMessage() === undefined).should.be.true;
    });
    it('Valid channelid', (): void => {
        const responseMessage = 'Hey there';
        const msg = `Response Message set to ${responseMessage}`;
        command = new SetResponseMessageCommand(responseMessage.split(' '));

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        server.messageCheckerSettings.getResponseMessage()!.should.equals(responseMessage);
    });
});
