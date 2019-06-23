import { should } from "chai";
import { GetResponseMessageCommand } from "../../main/command/messagecheckercommands/GetResponseMessageCommand";
import { Server } from "../../main/storage/Server";
import { Command } from "../../main/command/Command";
import { MessageCheckerSettings } from "../../main/storage/MessageCheckerSettings";
should();

let server: Server;
let command = new GetResponseMessageCommand();
let EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, "");
let EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, "");
let THIS_METHOD_SHOULD_NOT_BE_CALLED = Command.THIS_METHOD_SHOULD_NOT_BE_CALLED;
let CHANNEL_NOT_SET = GetResponseMessageCommand.CHANNEL_NOT_SET;
let EMBED_TITLE = GetResponseMessageCommand.EMBED_TITLE;

beforeEach(() => {
    server = new Server("123", new MessageCheckerSettings());
});

describe("GetResponseMessageCommand class test suite", () => {
    it("Message not set", () => {
        let embed = command.generateEmbed(server);

        //Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.equals(1);
        let field = embed.fields![0];
        field.name.should.equals(EMBED_TITLE);
        field.value.should.equals(CHANNEL_NOT_SET);
    });
    it("Message set", () => {
        let responseMessage = "testing";
        server.messageCheckerSettings.setResponseMessage(responseMessage);
        let embed = command.generateEmbed(server);

        //Check embed
        embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
        embed.fields!.length.should.equals(1);
        let field = embed.fields![0];
        field.name.should.equals(EMBED_TITLE);
        field.value.should.equals(`Response message is ${responseMessage}.`);
    });
    it("changeServerSettings should throw error", () => {
        try {
            command.changeServerSettings(server);
        } catch (err) {
            err.message.should.equals(THIS_METHOD_SHOULD_NOT_BE_CALLED);
        }
    });
});