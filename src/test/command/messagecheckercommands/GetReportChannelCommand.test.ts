import { should } from 'chai';
import { GetReportChannelCommand } from '../../../main/command/messagecheckercommands/GetReportChannelCommand';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';

should();

let server: Server;
const command = new GetReportChannelCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { CHANNEL_NOT_SET } = GetReportChannelCommand;
const { EMBED_TITLE } = GetReportChannelCommand;

beforeEach(() => {
    server = new Server('123', new MessageCheckerSettings());
});

describe('GetReportChannelCommand class test suite', () => {
    it('Channel not set', () => {
        const embed = command.generateEmbed(server);

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.equals(1);
        const field = embed.fields![0];
        field.name.should.equals(EMBED_TITLE);
        field.value.should.equals(CHANNEL_NOT_SET);
    });
    it('Channel set', () => {
        const channelId = '111';
        server.messageCheckerSettings.setReportingChannelId(channelId);
        const embed = command.generateEmbed(server);

        // Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.equals(1);
        const field = embed.fields![0];
        field.name.should.equals(EMBED_TITLE);
        field.value.should.equals(`Reporting Channel is currently set to <#${channelId}>.`);
    });
    it('changeServerSettings should throw error', () => {
        try {
            command.changeServerSettings(server);
        } catch (err) {
            err.message.should.equals(THIS_METHOD_SHOULD_NOT_BE_CALLED);
        }
    });
});
