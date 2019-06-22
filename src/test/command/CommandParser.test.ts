import { should } from 'chai';
import { CommandParser } from "../../main/command/CommandParser";
import { ListCommandsCommand } from '../../main/command/generalcommands/ListCommandsCommand';
import { ListWordsCommand } from '../../main/command/messagecheckercommands/ListWordsCommand';
import { AddWordCommand } from '../../main/command/messagecheckercommands/AddWordCommand';
import { RemoveWordCommand } from '../../main/command/messagecheckercommands/RemoveWordCommand';
import { SetReportChannelCommand } from '../../main/command/messagecheckercommands/SetReportChannelCommand';
import { GetReportChannelCommand } from '../../main/command/messagecheckercommands/GetReportChannelCommand';
import { SetResponseMessageCommand } from '../../main/command/messagecheckercommands/SetResponseMessageCommand';
import { GetResponseMessageCommand } from '../../main/command/messagecheckercommands/GetResponseMessageCommand';
import { SetDeleteMessageCommand } from '../../main/command/messagecheckercommands/SetDeleteMessageCommand';
import { NoSuchCommandError } from '../../main/command/error/NoSuchCommandError';
should();

const botId = "123456789";
describe("CommandParser test suite", () => {
    describe("isCommand test", () => {
        it("not tagging the bot, valid command 1", () => {
            const content = "bot help";
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it("not tagging the bot, valid command 2", () => {
            const content = "@123456789 help";
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it("not tagging the bot, valid command 3", () => {
            const content = "@123456789 help";
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it("tagging the bot correctly, invalid command 1", () => {
            const content = "<@!123456789> hahalolxd";
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it("tagging the bot correctly, invalid command 2", () => {
            const content = "<@123456789> hello";
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it("tagging the bot correctly, invalid command 3", () => {
            const content = "<@123456789> hello help";
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it("tagging the bot correctly, invalid command 4", () => {
            const content = "<@123456789> xd listwords";
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it("tagging the bot correctly, invalid command 5", () => {
            const content = "<@123456789> __General Commands__";
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it("tagging the bot correctly 1", () => {
            const content = "<@123456789> help";
            new CommandParser(content).isCommand(botId).should.be.true;
        });
        it("tagging the bot correctly 2", () => {
            const content = "<@!123456789> listwords";
            new CommandParser(content).isCommand(botId).should.be.true;
        });
        it("tagging the bot correctly 3", () => {
            const content = "<@!123456789> addwords";
            new CommandParser(content).isCommand(botId).should.be.true;
        });
        it("tagging the bot correctly 4", () => {
            const content = "<@!123456789> HeLp";
            new CommandParser(content).isCommand(botId).should.be.true;
        });
    });

    describe("getCommand test", () => {
        it("Help command", () => {
            const content = `<@123456789> ${ListCommandsCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof ListCommandsCommand).should.be.true;
        });
        it("Listwords command", () => {
            const content = `<@123456789> ${ListWordsCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof ListWordsCommand).should.be.true;
        });
        it("Addwords command", () => {
            const content = `<@123456789> ${AddWordCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof AddWordCommand).should.be.true;
        });
        it("Removewords command", () => {
            const content = `<@123456789> ${RemoveWordCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof RemoveWordCommand).should.be.true;
        });
        it("Setchannel command", () => {
            const content = `<@123456789> ${SetReportChannelCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof SetReportChannelCommand).should.be.true;
        });
        it("Getchannel command", () => {
            const content = `<@123456789> ${GetReportChannelCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof GetReportChannelCommand).should.be.true;
        });
        it("Setresponsemessage command", () => {
            const content = `<@123456789> ${SetResponseMessageCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof SetResponseMessageCommand).should.be.true;
        });
        it("Getresponsemessage command", () => {
            const content = `<@123456789> ${GetResponseMessageCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof GetResponseMessageCommand).should.be.true;
        });
        it("Setdeletemessage command", () => {
            const content = `<@123456789> ${SetDeleteMessageCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof SetDeleteMessageCommand).should.be.true;
        });
        it("Command that does not exist", () => {
            const content = "<@123456789> huh?";
            try {
                const command = new CommandParser(content).getCommand();
            } catch (err) {
                (err instanceof NoSuchCommandError).should.be.true;
                err.message.should.equals("No such command!");
            }
        });
    })
});