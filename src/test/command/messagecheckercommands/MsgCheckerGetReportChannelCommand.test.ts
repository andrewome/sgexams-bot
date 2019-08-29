/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-expressions */
import { should } from 'chai';
import { Permissions, RichEmbed } from 'discord.js';
import { MsgCheckerGetReportChannelCommand } from '../../../main/command/messagecheckercommands/MsgCheckerGetReportChannelCommand';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';

should();

let server: Server;
const adminPerms = new Permissions(['ADMINISTRATOR']);
const command = new MsgCheckerGetReportChannelCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { CHANNEL_NOT_SET } = MsgCheckerGetReportChannelCommand;
const { EMBED_TITLE } = MsgCheckerGetReportChannelCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('MsgCheckerGetReportChannelCommand class test suite', (): void => {
    it('No permission check', (): void => {
        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        }

        const noPerms = new Permissions([]);
        const commandResult = command.execute(server, noPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Channel not set', (): void => {
        const checkEmbed = (embed: RichEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_NOT_SET);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Channel set', (): void => {
        const channelId = '111';
        server.messageCheckerSettings.setReportingChannelId(channelId);

        const checkEmbed = (embed: RichEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(`Reporting Channel is currently set to <#${channelId}>.`);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
});
