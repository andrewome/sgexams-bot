import { should } from "chai";
import { SetReportChannelCommand, ResponseType } from "../../main/command/messagecheckercommands/SetReportChannelCommand";
import { Command } from "../../main/command/Command";
import { MessageCheckerSettings } from "../../main/storage/MessageCheckerSettings";
import { Server } from "../../main/storage/Server";
should();

let server: Server;
// can't test args because it is changed in execute function
let command = new SetReportChannelCommand(["arbitrary"]); 
let EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, "");
let EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, "");
let ERROR_EMBED_TITLE = Command.ERROR_EMBED_TITLE;
let NO_ARGUMENTS = Command.NO_ARGUMENTS;
let THIS_METHOD_SHOULD_NOT_BE_CALLED = Command.THIS_METHOD_SHOULD_NOT_BE_CALLED;
let CHANNEL_NOT_FOUND = SetReportChannelCommand.CHANNEL_NOT_FOUND;
let NOT_TEXT_CHANNEL = SetReportChannelCommand.NOT_TEXT_CHANNEL;
let EMBED_TITLE = SetReportChannelCommand.EMBED_TITLE;
let CHANNEL_RESETTED = SetReportChannelCommand.CHANNEL_RESETTED;
let CHANNELID_CANNOT_BE_UNDEFINED = SetReportChannelCommand.CHANNELID_CANNOT_BE_UNDEFINED;

beforeEach(() => {
    server = new Server("123", new MessageCheckerSettings());
});

describe("SetReportChannelCommand test suite", () => {
    describe("changeServerSettings test", () => {
        it("Change reporting channel", () => {
            let channelId = "12345";
            command.changeServerSettings(server, channelId);
            server.messageCheckerSettings.getReportingChannelId()!.should.equals(channelId);
        });
        it("Reset reporting channel", () => {
            let channelId = "12345";
            command.changeServerSettings(server, channelId);
            command.changeServerSettings(server, undefined);
            (server.messageCheckerSettings.getReportingChannelId() === undefined).should.be.true;
        });
    });
    describe("generateEmbed test", () => {
        it("reset channel", () => {
            let embed = command.generateEmbed(ResponseType.RESET);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_RESETTED);
        });
        it("not text channel", () => {
            let embed = command.generateEmbed(ResponseType.NOT_TEXT_CHANNEL);
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NOT_TEXT_CHANNEL);
        });
        it("cannot find channel", () => {
            let embed = command.generateEmbed(ResponseType.UNDEFINED);
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(CHANNEL_NOT_FOUND);
        });
        it("Valid channelid", () => {
            let channelId = "12345";
            let msg = `Reporting Channel set to <#${channelId}>.`
            let embed = command.generateEmbed(ResponseType.VALID, channelId);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        });
        it("Valid, but no channelid", () => {
            try {
                let embed = command.generateEmbed(ResponseType.VALID);
            } catch (err) {
                err.message.should.equals(CHANNELID_CANNOT_BE_UNDEFINED);
            }
        });
    })
});