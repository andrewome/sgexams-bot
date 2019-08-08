/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
 RichEmbed, Permissions, Collection, Channel, Client,
} from 'discord.js';
import { SetReportChannelCommand } from '../../../main/command/messagecheckercommands/SetReportChannelCommand';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';

should();

let server: Server;
let command: SetReportChannelCommand;
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
const { CHANNEL_NOT_FOUND } = SetReportChannelCommand;
const { NOT_TEXT_CHANNEL } = SetReportChannelCommand;
const { EMBED_TITLE } = SetReportChannelCommand;
const { CHANNEL_RESETTED } = SetReportChannelCommand;
const { CHANNELID_CANNOT_BE_UNDEFINED } = SetReportChannelCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('SetReportChannelCommand test suite', (): void => {
    it('reset channel', (): void => {
        server.messageCheckerSettings.setReportingChannelId('123');
        command = new SetReportChannelCommand([]);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_RESETTED);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed, channels);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        (server.messageCheckerSettings.getReportingChannelId() === undefined).should.be.true;
    });
    it('not text channel', (): void => {
        command = new SetReportChannelCommand(['not_text_channel']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_TEXT_CHANNEL);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed, channels);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('cannot find channel', (): void => {
        command = new SetReportChannelCommand(['does_not_exist']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_NOT_FOUND);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed, channels);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Valid channelid', (): void => {
        const channelId = 'text_channel';
        const msg = `Reporting Channel set to <#${channelId}>.`;
        command = new SetReportChannelCommand([channelId]);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed, channels);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        server.messageCheckerSettings.getReportingChannelId()!.should.equals(channelId);
    });
});
