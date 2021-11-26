/* eslint-disable @typescript-eslint/no-unused-vars, max-len */
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
import { CommandCollection } from '../../main/command/classes/CommandCollection';
import { StarboardGetChannelCommand } from '../../main/command/starboardcommands/StarboardGetChannelCommand';
import { StarboardGetEmojiCommand } from '../../main/command/starboardcommands/StarboardGetEmojiCommand';
import { StarboardGetThresholdCommand } from '../../main/command/starboardcommands/StarboardGetThresholdCommand';
import { StarboardSetChannelCommand } from '../../main/command/starboardcommands/StarboardSetChannelCommand';
import { MsgCheckerHelpCommand } from '../../main/command/helpcommands/MsgCheckerHelpCommand';
import { StarboardHelpCommand } from '../../main/command/helpcommands/StarboardHelpCommand';
import { MiscCommandHelpCommand } from '../../main/command/helpcommands/MiscCommandHelpCommand';
import { StarboardSetThresholdCommand } from '../../main/command/starboardcommands/StarboardSetThresholdCommand';
import { RotateImageCommand } from '../../main/command/misccommands/RotateImageCommand';
import { UptimeCheckCommand } from '../../main/command/misccommands/UptimeCheckCommand';
import { StarboardAddEmojiCommand } from '../../main/command/starboardcommands/StarboardAddEmojiCommand';
import { StarboardRemoveEmojiCommand } from '../../main/command/starboardcommands/StarboardRemoveEmojiCommand';

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
            const content = `<@!123456789> ${MsgCheckerListWordsCommand.NAME}`;
            new CommandParser(content).isCommand(botId).should.be.true;
        });
        it('tagging the bot correctly 3', (): void => {
            const content = `<@!123456789> ${MsgCheckerAddWordCommand.NAME}`;
            new CommandParser(content).isCommand(botId).should.be.true;
        });
        it('tagging the bot correctly 4', (): void => {
            const content = `<@!123456789> ${HelpCommand.NAME}`;
            new CommandParser(content).isCommand(botId).should.be.true;
        });
    });

    describe('getCommand test', (): void => {
        it('Help command', (): void => {
            const content = `<@123456789> ${HelpCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof HelpCommand).should.be.true;
        });
        it('MsgChecker Help command', (): void => {
            const content = `<@123456789> ${MsgCheckerHelpCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerHelpCommand).should.be.true;
        });
        it('Starboard Help command', (): void => {
            const content = `<@123456789> ${StarboardHelpCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof StarboardHelpCommand).should.be.true;
        });
        it('Rotate Image Help command', (): void => {
            const content = `<@123456789> ${MiscCommandHelpCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MiscCommandHelpCommand).should.be.true;
        });
        it('MsgChecker Listwords command', (): void => {
            const content = `<@123456789> ${MsgCheckerListWordsCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerListWordsCommand).should.be.true;
        });
        it('MsgChecker Addwords command', (): void => {
            const content = `<@123456789> ${MsgCheckerAddWordCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerAddWordCommand).should.be.true;
        });
        it('MsgChecker Removewords command', (): void => {
            const content = `<@123456789> ${MsgCheckerRemoveWordCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerRemoveWordCommand).should.be.true;
        });
        it('MsgChecker Setchannel command', (): void => {
            const content = `<@123456789> ${MsgCheckerSetReportChannelCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerSetReportChannelCommand).should.be.true;
        });
        it('MsgChecker Getchannel command', (): void => {
            const content = `<@123456789> ${MsgCheckerGetReportChannelCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerGetReportChannelCommand).should.be.true;
        });
        it('MsgChecker Setresponsemessage command', (): void => {
            const content = `<@123456789> ${MsgCheckerSetResponseMessageCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerSetResponseMessageCommand).should.be.true;
        });
        it('MsgChecker Getresponsemessage command', (): void => {
            const content = `<@123456789> ${MsgCheckerGetResponseMessageCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerGetResponseMessageCommand).should.be.true;
        });
        it('MsgChecker Setdeletemessage command', (): void => {
            const content = `<@123456789> ${MsgCheckerSetDeleteMessageCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof MsgCheckerSetDeleteMessageCommand).should.be.true;
        });
        it('Starboard GetChannel command', (): void => {
            const content = `<@123456789> ${StarboardGetChannelCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof StarboardGetChannelCommand).should.be.true;
        });
        it('Starboard GetEmoji command', (): void => {
            const content = `<@123456789> ${StarboardGetEmojiCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof StarboardGetEmojiCommand).should.be.true;
        });
        it('Starboard GetThreshold command', (): void => {
            const content = `<@123456789> ${StarboardGetThresholdCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof StarboardGetThresholdCommand).should.be.true;
        });
        it('Starboard SetChannel command', (): void => {
            const content = `<@123456789> ${StarboardSetChannelCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof StarboardSetChannelCommand).should.be.true;
        });
        it('Starboard AddEmoji command', (): void => {
            const content = `<@123456789> ${StarboardAddEmojiCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof StarboardAddEmojiCommand).should.be.true;
        });
        it('Starboard RemoveEmoji command', (): void => {
            const content = `<@123456789> ${StarboardRemoveEmojiCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof StarboardRemoveEmojiCommand).should.be.true;
        });
        it('Starboard SetThreshold command', (): void => {
            const content = `<@123456789> ${StarboardSetThresholdCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof StarboardSetThresholdCommand).should.be.true;
        });
        it('Rotate Image command', (): void => {
            const content = `<@123456789> ${RotateImageCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof RotateImageCommand).should.be.true;
        });
        it('Uptime Check command', (): void => {
            const content = `<@123456789> ${UptimeCheckCommand.NAME}`;
            const command = new CommandParser(content).getCommand();
            (command instanceof UptimeCheckCommand).should.be.true;
        });
        it('Command that does not exist', (): void => {
            const content = '<@123456789> huh?';
            try {
                const command = new CommandParser(content).getCommand();
            } catch (err) {
                (err instanceof NoSuchCommandError).should.be.true;
                if ((err instanceof NoSuchCommandError))
                    err.message.should.equals('No such command!');
            }
        });
    });
});
