/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { RichEmbed, Permissions } from 'discord.js';
import { SetDeleteMessageCommand, ResponseType } from '../../../main/command/messagecheckercommands/SetDeleteMessageCommand';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { CommandResult } from '../../../main/command/classes/CommandResult';

should();

let server: Server;
let command: SetDeleteMessageCommand;
const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { INCORRECT_FORMAT } = SetDeleteMessageCommand;
const { EMBED_TITLE } = SetDeleteMessageCommand;
const { BOOL_CANNOT_BE_UNDEFINED } = SetDeleteMessageCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('SetDeleteMessageCommand test suite', (): void => {
    it('No arguments', (): void => {
        command = new SetDeleteMessageCommand([]);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NO_ARGUMENTS);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Wrong format', (): void => {
        command = new SetDeleteMessageCommand(['something']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(INCORRECT_FORMAT);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Correct format, true', (): void => {
        command = new SetDeleteMessageCommand(['true']);
        const msg = 'Delete Message set to: **TRUE**';

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check server settings, should be true
        server.messageCheckerSettings.getDeleteMessage().should.be.true;

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;
    });
    it('Correct format, true all caps', (): void => {
        command = new SetDeleteMessageCommand(['TRUE']);
        const msg = 'Delete Message set to: **TRUE**';

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check server settings, should be true
        server.messageCheckerSettings.getDeleteMessage().should.be.true;

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;
    });
    it('Correct format, true mixed caps', (): void => {
        command = new SetDeleteMessageCommand(['TRuE']);
        const msg = 'Delete Message set to: **TRUE**';

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check server settings, should be true
        server.messageCheckerSettings.getDeleteMessage().should.be.true;

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;
    });
    it('Correct format, false', (): void => {
        command = new SetDeleteMessageCommand(['false']);
        const msg = 'Delete Message set to: **FALSE**';

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        // Check server settings, should be true
        server.messageCheckerSettings.getDeleteMessage().should.be.false;

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check server settings, should be false
        server.messageCheckerSettings.getDeleteMessage().should.be.false;

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;
    });
});
