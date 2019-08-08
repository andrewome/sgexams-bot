/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
 RichEmbed, Permissions, Collection, Channel, Client,
} from 'discord.js';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { SetStarboardThresholdCommand } from '../../../main/command/starboardcommands/SetStarboardThresholdCommand';

should();

let server: Server;
let command: SetStarboardThresholdCommand;
const channels = new Collection<string, Channel>();

// Setting up mock channels.
let channel = new Channel(new Client(), {});
channel.type = 'text';
channels.set('text_channel', channel);
channel = new Channel(new Client(), {});
channel.type = 'voice';
channels.set('not_text_channel', channel);

const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { EMBED_TITLE } = SetStarboardThresholdCommand;
const { THRESHOLD_RESETTED } = SetStarboardThresholdCommand;
const { THRESHOLD_CANNOT_BE_UNDEFINED } = SetStarboardThresholdCommand;
const { NOT_AN_INTEGER } = SetStarboardThresholdCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('SetReportChannelCommand test suite', (): void => {
    it('reset threshold', (): void => {
        const threshold = 10;
        server.starboardSettings.setThreshold(threshold);
        command = new SetStarboardThresholdCommand([]);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(THRESHOLD_RESETTED);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        (server.starboardSettings.getThreshold() === null).should.be.true;
    });
    it('Valid threshold', (): void => {
        const threshold = 10;
        const msg = `Starboard threshold set to ${threshold}.`;
        command = new SetStarboardThresholdCommand([threshold.toString(10)]);

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
        server.starboardSettings.getThreshold()!.should.equals(threshold);
    });
    it('Invalid threshold - String', (): void => {
        command = new SetStarboardThresholdCommand(['haha']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_AN_INTEGER);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Invalid threshold - Out of range value 1', (): void => {
        command = new SetStarboardThresholdCommand(['0']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_AN_INTEGER);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Invalid threshold - Out of range value 2', (): void => {
        command = new SetStarboardThresholdCommand(['-5']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_AN_INTEGER);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
});
