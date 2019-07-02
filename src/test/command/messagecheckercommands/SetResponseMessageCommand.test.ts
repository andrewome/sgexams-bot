/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { SetResponseMessageCommand, ResponseType } from '../../../main/command/messagecheckercommands/SetResponseMessageCommand';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';

should();

let server: Server;
// can't test args because it is changed in execute function
const command = new SetResponseMessageCommand(['arbitrary']);
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
    describe('changeServerSettings test', (): void => {
        it('Change response message', (): void => {
            const responseMessage = 'Hey there';
            command.changeServerSettings(server, responseMessage);
            server.messageCheckerSettings.getResponseMessage()!.should.equals(responseMessage);
        });
        it('Reset reporting channel', (): void => {
            const responseMessage = 'Hey there';
            command.changeServerSettings(server, responseMessage);
            command.changeServerSettings(server, undefined);
            (server.messageCheckerSettings.getResponseMessage() === undefined).should.be.true;
        });
    });
    describe('generateEmbed test', (): void => {
        it('reset response message', (): void => {
            const embed = command.generateEmbed(ResponseType.RESET);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(MESSAGE_RESETTED);
        });
        it('Valid channelid', (): void => {
            const responseMessage = 'Hey there';
            const msg = `Response Message set to ${responseMessage}`;
            const embed = command.generateEmbed(ResponseType.VALID, responseMessage);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        });
        it('Valid, but no message', (): void => {
            try {
                const embed = command.generateEmbed(ResponseType.VALID);
            } catch (err) {
                err.message.should.equals(RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED);
            }
        });
    });
});
