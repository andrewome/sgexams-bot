/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
    MessageEmbed, Permissions, Collection, Channel, Client,
} from 'discord.js';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { StarboardSetChannelCommand } from '../../../main/command/starboardcommands/StarboardSetChannelCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
let command: StarboardSetChannelCommand;
const channels = new Collection<string, Channel>();

/* BROKEN DUE TO UPDATE TO MANAGERS IN DISCORD.JS v12
// Setting up mock channels.
let channel = new Channel(new Client(), {});
channel.type = 'text';
channels.set('text_channel', channel);
channel = new Channel(new Client(), {});
channel.type = 'voice';
channels.set('not_text_channel', channel);
*/

const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { CHANNEL_NOT_FOUND } = StarboardSetChannelCommand;
const { NOT_TEXT_CHANNEL } = StarboardSetChannelCommand;
const { EMBED_TITLE } = StarboardSetChannelCommand;
const { CHANNEL_RESETTED } = StarboardSetChannelCommand;
const { CHANNELID_CANNOT_BE_UNDEFINED } = StarboardSetChannelCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
    );
});

describe('StarboardSetReportChannelCommand test suite', (): void => {
    it('No permission check', (): void => {
        command = new StarboardSetChannelCommand([]);
        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: new Permissions([]),
            messageReply: checkEmbed,
        };
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
/* BROKEN DUE TO UPDATE TO MANAGERS IN DISCORD.JS v12
    it('reset channel', (): void => {
        server.starboardSettings.setChannel('123');
        command = new StarboardSetChannelCommand([]);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_RESETTED);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.channels = channels;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;

        // Check server
        (server.starboardSettings.getChannel() === null).should.be.true;
    });
    it('not text channel', (): void => {
        command = new StarboardSetChannelCommand(['not_text_channel']);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_TEXT_CHANNEL);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.channels = channels;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('cannot find channel', (): void => {
        command = new StarboardSetChannelCommand(['does_not_exist']);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_NOT_FOUND);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.channels = channels;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Valid channelid', (): void => {
        const channelId = 'text_channel';
        const msg = `Starboard Channel set to <#${channelId}>.`;
        command = new StarboardSetChannelCommand([channelId]);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.channels = channels;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;

        // Check server
        server.starboardSettings.getChannel()!.should.equals(channelId);
    });
*/
});
