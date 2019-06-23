import { should } from "chai";
import { SetDeleteMessageCommand, ResponseType } from "../../main/command/messagecheckercommands/SetDeleteMessageCommand";
import { Command } from "../../main/command/Command";
import { MessageCheckerSettings } from "../../main/storage/MessageCheckerSettings";
import { Server } from "../../main/storage/Server";
should();

let server: Server;
// can't test args because it is changed in execute function
let command = new SetDeleteMessageCommand(["arbitrary"]); 
let EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, "");
let EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, "");
let ERROR_EMBED_TITLE = Command.ERROR_EMBED_TITLE;
let NO_ARGUMENTS = Command.NO_ARGUMENTS;
let THIS_METHOD_SHOULD_NOT_BE_CALLED = Command.THIS_METHOD_SHOULD_NOT_BE_CALLED;
let INCORRECT_FORMAT = SetDeleteMessageCommand.INCORRECT_FORMAT;
let EMBED_TITLE = SetDeleteMessageCommand.EMBED_TITLE;
let BOOL_CANNOT_BE_UNDEFINED = SetDeleteMessageCommand.BOOL_CANNOT_BE_UNDEFINED

beforeEach(() => {
    server = new Server("123", new MessageCheckerSettings());
});

describe("SetDeleteMessageCommand test suite", () => {
    describe("changeServerSettings test", () => {
        it("Should become from false to true", () => {
            command.changeServerSettings(server, true);
            server.messageCheckerSettings.getDeleteMessage().should.be.true;
        });
        it("Should become from true to false", () => {
            command.changeServerSettings(server, true); // false by default
            command.changeServerSettings(server, false);
            server.messageCheckerSettings.getDeleteMessage().should.be.false;
        });
    });
    describe("generateEmbed test", () => {
        it("No arguments", () => {
            let embed = command.generateEmbed(ResponseType.NO_ARGUMENTS);
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NO_ARGUMENTS);
        });
        it("Wrong format", () => {
            let embed = command.generateEmbed(ResponseType.WRONG_FORMAT);
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(INCORRECT_FORMAT);
        });
        it("Correct format, true", () => {
            let msg = "Delete Message set to: **TRUE**";
            let embed = command.generateEmbed(ResponseType.VALID_FORMAT, true);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        });
        it("Correct format, false", () => {
            let msg = "Delete Message set to: **FALSE**";
            let embed = command.generateEmbed(ResponseType.VALID_FORMAT, false);
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            let field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        });
        it("Correct format but bool not set", () => {
            try {
                let embed = command.generateEmbed(ResponseType.WRONG_FORMAT);
            } catch (err) {
                err.message.should.equals(BOOL_CANNOT_BE_UNDEFINED);
            }
        });
    })
});