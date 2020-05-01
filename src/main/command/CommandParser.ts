import { Command } from './Command';
import { MsgCheckerListWordsCommand } from './messagecheckercommands/MsgCheckerListWordsCommand';
import { MsgCheckerSetReportChannelCommand } from './messagecheckercommands/MsgCheckerSetReportChannelCommand';
import { MsgCheckerAddWordCommand } from './messagecheckercommands/MsgCheckerAddWordCommand';
import { MsgCheckerRemoveWordCommand } from './messagecheckercommands/MsgCheckerRemoveWordCommand';
import { NoSuchCommandError } from './error/NoSuchCommandError';
import { MsgCheckerGetReportChannelCommand } from './messagecheckercommands/MsgCheckerGetReportChannelCommand';
import { HelpCommand } from './helpcommands/HelpCommand';
import { MsgCheckerSetResponseMessageCommand } from './messagecheckercommands/MsgCheckerSetResponseMessageCommand';
import { MsgCheckerGetResponseMessageCommand } from './messagecheckercommands/MsgCheckerGetResponseMessageCommand';
import { MsgCheckerSetDeleteMessageCommand } from './messagecheckercommands/MsgCheckerSetDeleteMessageCommand';
import { StarboardSetChannelCommand } from './starboardcommands/StarboardSetChannelCommand';
import { StarboardGetChannelCommand } from './starboardcommands/StarboardGetChannelCommand';
import { StarboardGetEmojiCommand } from './starboardcommands/StarboardGetEmojiCommand';
import { StarboardGetThresholdCommand } from './starboardcommands/StarboardGetThresholdCommand';
import { StarboardSetThresholdCommand } from './starboardcommands/StarboardSetThresholdCommand';
import { RotateImageCommand } from './misccommands/RotateImageCommand';
import { CommandNamesAndDescriptions } from './classes/CommandNamesAndDescriptions';
import { MsgCheckerHelpCommand } from './helpcommands/MsgCheckerHelpCommand';
import { StarboardHelpCommand } from './helpcommands/StarboardHelpCommand';
import { MiscCommandHelpCommand } from './helpcommands/MiscCommandHelpCommand';
import { UptimeCheckCommand } from './misccommands/UptimeCheckCommand';
import { StarboardAddEmojiCommand } from './starboardcommands/StarboardAddEmojiCommand';
import { StarboardRemoveEmojiCommand } from './starboardcommands/StarboardRemoveEmojiCommand';
import { OkBoomerCommand } from './misccommands/OkBoomerCommand';
import { OkZoomerCommand } from './misccommands/OkZoomerCommand';
import { WarnCommand } from './moderationcommands/WarnCommand';
import { KickCommand } from './moderationcommands/KickCommand';
import { BanCommand } from './moderationcommands/BanCommand';


export class CommandParser {
    public static NO_SUCH_COMMAND = 'No such command!';

    /** Set of all Command Names from CommandNamesAndDescriptions */
    public static commandsLowerCase: Set<string>
        = new Set<string>(([] as string[]).concat(
            CommandNamesAndDescriptions.MSGCHECKER_COMMANDS_LOWERCASE,
            CommandNamesAndDescriptions.MISC_COMMANDS_LOWERCASE,
            CommandNamesAndDescriptions.STARBOARD_COMMANDS_LOWERCASE,
            CommandNamesAndDescriptions.HELP_COMMANDS_LOWERCASE,
            CommandNamesAndDescriptions.MODERATION_COMMANDS_LOWERCASE,
        ));

    private content: string;

    private splittedContent: string[];

    /**
     * Constructor, takes in content and gets the splitted content
     * splitted by ' '
     *
     * @param  {string} content
     */
    public constructor(content: string) {
        this.content = content;
        this.splittedContent = this.content.split(/ +/g);
    }

    /**
     * This method returns true if the content was a command. False if not
     *
     * @param  {string} selfId self id of the bot itself
     * @returns boolean
     */
    public isCommand(selfId: string): boolean {
        // Check if bot is mentioned as the 1st word
        if (!(new RegExp(`<@!?${selfId}>`).test(this.splittedContent[0]))) {
            return false;
        }

        // Check length of splittedContent.
        // 1 means only the bot was tagged; there's no command.
        if (this.splittedContent.length === 1) {
            return false;
        }

        let command = this.splittedContent[1];
        command = command.toLowerCase();

        // Check if command word is the 2nd word
        if (!CommandParser.commandsLowerCase.has(command)) {
            return false;
        }

        return true;
    }

    /**
     * This function returns the arguments of the command
     * returns index 2 onwards, because 0 is the bot mention
     * and index 1 is the command
     *
     * @returns string[]
     */
    private getArgs(): string[] {
        const { length } = this.splittedContent;
        if (length > 1) {
            return this.splittedContent.slice(2, length);
        }
        return [];
    }


    /**
     * This method returns the Command object based on the Command word mentioned.
     *
     * @returns Command
     */
    /* eslint-disable max-len */
    public getCommand(): Command {
        const command = this.splittedContent[1].toLowerCase();
        const args = this.getArgs();
        switch (command) {
            case CommandNamesAndDescriptions.MSGCHECKER_LIST_WORDS_COMMAND_NAME.toLowerCase():
                return new MsgCheckerListWordsCommand();
            case CommandNamesAndDescriptions.MSGCHECKER_SET_REPORT_CHANNEL_COMMAND_NAME.toLowerCase():
                return new MsgCheckerSetReportChannelCommand(args);
            case CommandNamesAndDescriptions.MSGCHECKER_ADD_WORD_COMMAND_NAME.toLowerCase():
                return new MsgCheckerAddWordCommand(args);
            case CommandNamesAndDescriptions.MSGCHECKER_REMOVE_WORD_COMMAND_NAME.toLowerCase():
                return new MsgCheckerRemoveWordCommand(args);
            case CommandNamesAndDescriptions.MSGCHECKER_GET_REPORT_CHANNEL_COMMAND_NAME.toLowerCase():
                return new MsgCheckerGetReportChannelCommand();
            case CommandNamesAndDescriptions.MSGCHECKER_SET_RESPONSE_MESSAGE_COMMAND_NAME.toLowerCase():
                return new MsgCheckerSetResponseMessageCommand(args);
            case CommandNamesAndDescriptions.MSGCHECKER_GET_RESPONSE_MESSAGE_COMMAND_NAME.toLowerCase():
                return new MsgCheckerGetResponseMessageCommand();
            case CommandNamesAndDescriptions.MSGCHECKER_SET_DELETE_MESSAGE_COMMAND_NAME.toLowerCase():
                return new MsgCheckerSetDeleteMessageCommand(args);
            case CommandNamesAndDescriptions.STARBOARD_SET_CHANNEL_COMMAND_NAME.toLowerCase():
                return new StarboardSetChannelCommand(args);
            case CommandNamesAndDescriptions.STARBOARD_GET_CHANNEL_COMMAND_NAME.toLowerCase():
                return new StarboardGetChannelCommand();
            case CommandNamesAndDescriptions.STARBOARD_GET_EMOJI_COMMAND_NAME.toLowerCase():
                return new StarboardGetEmojiCommand();
            case CommandNamesAndDescriptions.STARBOARD_ADD_EMOJI_COMMAND_NAME.toLowerCase():
                return new StarboardAddEmojiCommand(args);
            case CommandNamesAndDescriptions.STARBOARD_REMOVE_EMOJI_COMMAND_NAME.toLowerCase():
                return new StarboardRemoveEmojiCommand(args);
            case CommandNamesAndDescriptions.STARBOARD_GET_THRESHOLD_COMMAND_NAME.toLowerCase():
                return new StarboardGetThresholdCommand();
            case CommandNamesAndDescriptions.STARBOARD_SET_THRESHOLD_COMMAND_NAME.toLowerCase():
                return new StarboardSetThresholdCommand(args);
            case CommandNamesAndDescriptions.ROTATE_IMAGE_COMMAND_NAME.toLowerCase():
                return new RotateImageCommand(args);
            case CommandNamesAndDescriptions.HELP_COMMAND_NAME.toLowerCase():
                return new HelpCommand();
            case CommandNamesAndDescriptions.MSGCHECKER_HELP_COMMAND_NAME.toLowerCase():
                return new MsgCheckerHelpCommand();
            case CommandNamesAndDescriptions.STARBOARD_HELP_COMMAND_NAME.toLowerCase():
                return new StarboardHelpCommand();
            case CommandNamesAndDescriptions.MISC_COMMAND_HELP_COMMAND_NAME.toLowerCase():
                return new MiscCommandHelpCommand();
            case CommandNamesAndDescriptions.UPTIME_CHECK_COMMAND_NAME.toLowerCase():
                return new UptimeCheckCommand();
            case CommandNamesAndDescriptions.OKBOOMER_COMMAND_NAME.toLowerCase():
                return new OkBoomerCommand(args);
            case CommandNamesAndDescriptions.OKZOOMER_COMMAND_NAME.toLowerCase():
                return new OkZoomerCommand(args);
            case CommandNamesAndDescriptions.WARN_COMMAND_NAME.toLowerCase():
                return new WarnCommand(args);
            case CommandNamesAndDescriptions.KICK_COMMAND_NAME.toLowerCase():
                return new KickCommand(args);
            case CommandNamesAndDescriptions.BAN_COMMAND_NAME.toLowerCase():
                return new BanCommand(args);
            default:
                throw new NoSuchCommandError(CommandParser.NO_SUCH_COMMAND);
        }
    }
}
