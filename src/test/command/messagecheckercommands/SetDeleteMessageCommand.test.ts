/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { SetDeleteMessageCommand, ResponseType } from '../../../main/command/messagecheckercommands/SetDeleteMessageCommand';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';

should();

let server: Server;
// can't test args because it is changed in execute function
const command = new SetDeleteMessageCommand(['arbitrary']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { INCORRECT_FORMAT } = SetDeleteMessageCommand;
const { EMBED_TITLE } = SetDeleteMessageCommand;
const { BOOL_CANNOT_BE_UNDEFINED } = SetDeleteMessageCommand;

beforeEach((): void => {
    server = new Server('123', new MessageCheckerSettings());
});

describe('SetDeleteMessageCommand test suite', (): void => {
    describe('changeServerSettings test', (): void => {
        it('Should become from false to true', (): void => {
            command.changeServerSettings(server, true);
            server.messageCheckerSettings.getDeleteMessage().should.be.true;
        });
        it('Should become from true to false', (): void => {
            command.changeServerSettings(server, true); // false by default
            command.changeServerSettings(server, false);
            server.messageCheckerSettings.getDeleteMessage().should.be.false;
        });
    });
    describe('generateEmbed test', (): void => {
        it('No arguments', (): void => {
            const embed = command.generateEmbed(ResponseType.NO_ARGUMENTS);
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NO_ARGUMENTS);
        });
        it('Wrong format', (): void => {
            const embed = command.generateEmbed(ResponseType.WRONG_FORMAT);
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(INCORRECT_FORMAT);
        });
        it('Correct format, true', (): void => {
            const msg = 'Delete Message set to: **TRUE**';
            const embed = command.generateEmbed(ResponseType.VALID_FORMAT, true);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        });
        it('Correct format, false', (): void => {
            const msg = 'Delete Message set to: **FALSE**';
            const embed = command.generateEmbed(ResponseType.VALID_FORMAT, false);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        });
        it('Correct format but bool not set', (): void => {
            try {
                const embed = command.generateEmbed(ResponseType.WRONG_FORMAT);
            } catch (err) {
                err.message.should.equals(BOOL_CANNOT_BE_UNDEFINED);
            }
        });
    });
});
