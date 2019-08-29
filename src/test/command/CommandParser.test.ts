/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import { CommandParser } from '../../main/command/CommandParser';
import { HelpCommand } from '../../main/command/helpcommands/HelpCommand';
import { MsgCheckerListWordsCommand } from '../../main/command/messagecheckercommands/MsgCheckerListWordsCommand';
import { MsgCheckerAddWordCommand } from '../../main/command/messagecheckercommands/MsgCheckerAddWordCommand';
import { MsgCheckerRemoveWordCommand } from '../../main/command/messagecheckercommands/MsgCheckerRemoveWordCommand';
import { MsgCheckerSetReportChannelCommand } from '../../main/command/messagecheckercommands/MsgCheckerSetReportChannelCommand';
import { MsgCheckerGetReportChannelCommand } from '../../main/command/messagecheckercommands/MsgCheckerGetReportChannelCommand';
import { MsgCheckerSetResponseMessageCommand } from '../../main/command/messagecheckercommands/MsgCheckerSetResponseMessageCommand';
import { MsgCheckerGetResponseMessageCommand } from '../../main/command/messagecheckercommands/MsgCheckerGetResponseMessageCommand';
import { MsgCheckerSetDeleteMessageCommand } from '../../main/command/messagecheckercommands/MsgCheckerSetDeleteMessageCommand';
import { NoSuchCommandError } from '../../main/command/error/NoSuchCommandError';

should();

const botId = '123456789';
describe('CommandParser test suite', (): void => {
    describe('isCommand test', (): void => {
        it('not tagging the bot, valid command 1', (): void => {
            const content = 'bot help';
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it('not tagging the bot, valid command 2', (): void => {
            const content = '@123456789 help';
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it('not tagging the bot, valid command 3', (): void => {
            const content = '@123456789 help';
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it('tagging the bot correctly, invalid command 1', (): void => {
            const content = '<@!123456789> hahalolxd';
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it('tagging the bot correctly, invalid command 2', (): void => {
            const content = '<@123456789> hello';
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it('tagging the bot correctly, invalid command 3', (): void => {
            const content = '<@123456789> hello help';
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it('tagging the bot correctly, invalid command 4', (): void => {
            const content = '<@123456789> xd listwords';
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it('tagging the bot correctly, invalid command 5', (): void => {
            const content = '<@123456789> __General Commands__';
            new CommandParser(content).isCommand(botId).should.be.false;
        });
        it('tagging the bot correctly 1', (): void => {
            const content = '<@123456789> help';
            new CommandParser(content).isCommand(botId).should.be.true;
        });
        it('tagging the bot correctly 2', (): void => {
            const content = `<@!123456789> ${MsgCheckerListWordsCommand.COMMAND_NAME}`;
            new CommandParser(content).isCommand(botId).should.be.true;
        });
        it('tagging the bot correctly 3', (): void => {
            const content = `<@!123456789> ${MsgCheckerAddWordCommand.COMMAND_NAME}`;
            new CommandParser(content).isCommand(botId).should.be.true;
        });
        it('tagging the bot correctly 4', (): void => {
            const content = '<@!123456789> HeLp';
            new CommandParser(content).isCommand(botId).should.be.true;
        });
    });

    describe('getCommand test', (): void => {
        it('Help command', (): void => {
            const content = `<@123456789> ${HelpCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof HelpCommand).should.be.true;
        });
        it('Listwords command', (): void => {
            const content = `<@123456789> ${MsgCheckerListWordsCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerListWordsCommand).should.be.true;
        });
        it('Addwords command', (): void => {
            const content = `<@123456789> ${MsgCheckerAddWordCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerAddWordCommand).should.be.true;
        });
        it('Removewords command', (): void => {
            const content = `<@123456789> ${MsgCheckerRemoveWordCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerRemoveWordCommand).should.be.true;
        });
        it('Setchannel command', (): void => {
            const content = `<@123456789> ${MsgCheckerSetReportChannelCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerSetReportChannelCommand).should.be.true;
        });
        it('Getchannel command', (): void => {
            const content = `<@123456789> ${MsgCheckerGetReportChannelCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerGetReportChannelCommand).should.be.true;
        });
        it('Setresponsemessage command', (): void => {
            const content = `<@123456789> ${MsgCheckerSetResponseMessageCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerSetResponseMessageCommand).should.be.true;
        });
        it('Getresponsemessage command', (): void => {
            const content = `<@123456789> ${MsgCheckerGetResponseMessageCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerGetResponseMessageCommand).should.be.true;
        });
        it('Setdeletemessage command', (): void => {
            const content = `<@123456789> ${MsgCheckerSetDeleteMessageCommand.COMMAND_NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerSetDeleteMessageCommand).should.be.true;
        });
        it('Command that does not exist', (): void => {
            const content = '<@123456789> huh?';
            try {
                const command = new CommandParser(content).getCommand();
            } catch (err) {
                (err instanceof NoSuchCommandError).should.be.true;
                err.message.should.equals('No such command!');
            }
        });
    });
});
