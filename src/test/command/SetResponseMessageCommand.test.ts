import { should } from "chai";
import { SetResponseMessageCommand, ResponseType } from "../../main/command/messagecheckercommands/SetResponseMessageCommand";
import { Command } from "../../main/command/Command";
import { MessageCheckerSettings } from "../../main/storage/MessageCheckerSettings";
import { Server } from "../../main/storage/Server";
should();

let server: Server;
// can't test args because it is changed in execute function
let command = new SetResponseMessageCommand(["arbitrary"]); 
let EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, "");
let EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, "");
let ERROR_EMBED_TITLE = Command.ERROR_EMBED_TITLE;
let NO_ARGUMENTS = Command.NO_ARGUMENTS;
let THIS_METHOD_SHOULD_NOT_BE_CALLED = Command.THIS_METHOD_SHOULD_NOT_BE_CALLED;
let MESSAGE_RESETTED = SetResponseMessageCommand.MESSAGE_RESETTED;
let EMBED_TITLE = SetResponseMessageCommand.EMBED_TITLE;
let RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED = SetResponseMessageCommand.RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED;

beforeEach(() => {
    server = new Server("123", new MessageCheckerSettings());
});

describe("SetResponseMessageCommand test suite", () => {
    describe("changeServerSettings test", () => {
        it("Change response message", () => {
            let responseMessage = "Hey there";
            command.changeServerSettings(server, responseMessage);
            server.messageCheckerSettings.getResponseMessage()!.should.equals(responseMessage);
        });
        it("Reset reporting channel", () => {
            let responseMessage = "Hey there";
            command.changeServerSettings(server, responseMessage);
            command.changeServerSettings(server, undefined);
            (server.messageCheckerSettings.getResponseMessage() === undefined).should.be.true;
        });
    });
    describe("generateEmbed test", () => {
        it("reset response message", () => {
            let embed = command.generateEmbed(ResponseType.RESET);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(MESSAGE_RESETTED);
        });
        it("Valid channelid", () => {
            let responseMessage = "Hey there";
            let msg = `Response Message set to ${responseMessage}`;
            let embed = command.generateEmbed(ResponseType.VALID, responseMessage);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        });
        it("Valid, but no message", () => {
            try {
                let embed = command.generateEmbed(ResponseType.VALID);
            } catch (err) {
                err.message.should.equals(RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED);
            }
        });
    })
});