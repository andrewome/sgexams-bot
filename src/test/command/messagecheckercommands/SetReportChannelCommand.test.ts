/* eslint-disable @typescript-eslint/no-unused-vars */
import { should } from 'chai';
import { SetReportChannelCommand, ResponseType } from '../../../main/command/messagecheckercommands/SetReportChannelCommand';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';

should();

let server: Server;
// can't test args because it is changed in execute function
const command = new SetReportChannelCommand(['arbitrary']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { THIS_METHOD_SHOULD_NOT_BE_CALLED } = Command;
const { CHANNEL_NOT_FOUND } = SetReportChannelCommand;
const { NOT_TEXT_CHANNEL } = SetReportChannelCommand;
const { EMBED_TITLE } = SetReportChannelCommand;
const { CHANNEL_RESETTED } = SetReportChannelCommand;
const { CHANNELID_CANNOT_BE_UNDEFINED } = SetReportChannelCommand;

beforeEach((): void => {
    server = new Server('123', new MessageCheckerSettings());
});

describe('SetReportChannelCommand test suite', (): void => {
    describe('changeServerSettings test', (): void => {
        it('Change reporting channel', (): void => {
            const channelId = '12345';
            command.changeServerSettings(server, channelId);
            server.messageCheckerSettings.getReportingChannelId()!.should.equals(channelId);
        });
        it('Reset reporting channel', (): void => {
            const channelId = '12345';
            command.changeServerSettings(server, channelId);
            command.changeServerSettings(server, undefined);
            (server.messageCheckerSettings.getReportingChannelId() === undefined).should.be.true;
        });
    });
    describe('generateEmbed test', (): void => {
        it('reset channel', (): void => {
            const embed = command.generateEmbed(ResponseType.RESET);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_RESETTED);
        });
        it('not text channel', (): void => {
            const embed = command.generateEmbed(ResponseType.NOT_TEXT_CHANNEL);
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_TEXT_CHANNEL);
        });
        it('cannot find channel', (): void => {
            const embed = command.generateEmbed(ResponseType.UNDEFINED);
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_NOT_FOUND);
        });
        it('Valid channelid', (): void => {
            const channelId = '12345';
            const msg = `Reporting Channel set to <#${channelId}>.`;
            const embed = command.generateEmbed(ResponseType.VALID, channelId);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        });
        it('Valid, but no channelid', (): void => {
            try {
                const embed = command.generateEmbed(ResponseType.VALID);
            } catch (err) {
                err.message.should.equals(CHANNELID_CANNOT_BE_UNDEFINED);
            }
        });
    });
});
