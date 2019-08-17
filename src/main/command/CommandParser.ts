import { Command } from './Command';
import { MsgCheckerListWordsCommand } from './messagecheckercommands/MsgCheckerListWordsCommand';
import { MsgCheckerSetReportChannelCommand } from './messagecheckercommands/MsgCheckerSetReportChannelCommand';
import { MsgCheckerAddWordCommand } from './messagecheckercommands/MsgCheckerAddWordCommand';
import { MsgCheckerRemoveWordCommand } from './messagecheckercommands/MsgCheckerRemoveWordCommand';
import { NoSuchCommandError } from './error/NoSuchCommandError';
import { MsgCheckerGetReportChannelCommand } from './messagecheckercommands/MsgCheckerGetReportChannelCommand';
import { ListCommandsCommand } from './generalcommands/ListCommandsCommand';
import { MsgCheckerSetResponseMessageCommand } from './messagecheckercommands/MsgCheckerSetResponseMessageCommand';
import { MsgCheckerGetResponseMessageCommand } from './messagecheckercommands/MsgCheckerGetResponseMessageCommand';
import { MsgCheckerSetDeleteMessageCommand } from './messagecheckercommands/MsgCheckerSetDeleteMessageCommand';
import { SetStarboardChannelCommand } from './starboardcommands/SetStarboardChannelCommand';
import { GetStarboardChannelCommand } from './starboardcommands/GetStarboardChannelCommand';
import { SetStarboardEmojiCommand } from './starboardcommands/SetStarboardEmojiCommand';
import { GetStarboardEmojiCommand } from './starboardcommands/GetStarboardEmojiCommand';
import { GetStarboardThresholdCommand } from './starboardcommands/GetStarboardThresholdCommand';
import { SetStarboardThresholdCommand } from './starboardcommands/SetStarboardThresholdCommand';
import { RotateImageCommand } from './rotateimagecommands/RotateImageCommand';

export class CommandParser {
    public static EMPTY_STRING = '\u200b';

    public static GENERAL_COMMANDS_HEADER = '__General Commands__';

    public static MESSAGE_CHECKER_COMMANDS_HEADER = '__Message Checker Commands__';

    public static STARBOARD_COMMANDS_HEADER = '__Starboard Commands__';

    public static NO_SUCH_COMMAND = 'No such command!';

    public static notCommands: Set<string>
        = new Set<string>([CommandParser.GENERAL_COMMANDS_HEADER.toLowerCase(),
                           CommandParser.MESSAGE_CHECKER_COMMANDS_HEADER.toLowerCase(),
                           CommandParser.STARBOARD_COMMANDS_HEADER.toLowerCase()]);

    public static commands: Set<string>
        = new Set<string>([CommandParser.GENERAL_COMMANDS_HEADER,
                           ListCommandsCommand.COMMAND_NAME,
                           CommandParser.MESSAGE_CHECKER_COMMANDS_HEADER,
                           MsgCheckerListWordsCommand.COMMAND_NAME,
                           MsgCheckerAddWordCommand.COMMAND_NAME,
                           MsgCheckerRemoveWordCommand.COMMAND_NAME,
                           MsgCheckerSetReportChannelCommand.COMMAND_NAME,
                           MsgCheckerGetReportChannelCommand.COMMAND_NAME,
                           MsgCheckerSetResponseMessageCommand.COMMAND_NAME,
                           MsgCheckerGetResponseMessageCommand.COMMAND_NAME,
                           MsgCheckerSetDeleteMessageCommand.COMMAND_NAME,
                           CommandParser.STARBOARD_COMMANDS_HEADER,
                           SetStarboardChannelCommand.COMMAND_NAME,
                           GetStarboardChannelCommand.COMMAND_NAME,
                           SetStarboardEmojiCommand.COMMAND_NAME,
                           GetStarboardEmojiCommand.COMMAND_NAME,
                           SetStarboardThresholdCommand.COMMAND_NAME,
                           GetStarboardThresholdCommand.COMMAND_NAME]);

    public static commandsLowerCase: Set<string>
        = new Set<string>([CommandParser.GENERAL_COMMANDS_HEADER,
                           ListCommandsCommand.COMMAND_NAME_LOWER_CASE,
                           CommandParser.MESSAGE_CHECKER_COMMANDS_HEADER,
                           MsgCheckerListWordsCommand.COMMAND_NAME_LOWER_CASE,
                           MsgCheckerAddWordCommand.COMMAND_NAME_LOWER_CASE,
                           MsgCheckerRemoveWordCommand.COMMAND_NAME_LOWER_CASE,
                           MsgCheckerSetReportChannelCommand.COMMAND_NAME_LOWER_CASE,
                           MsgCheckerGetReportChannelCommand.COMMAND_NAME_LOWER_CASE,
                           MsgCheckerSetResponseMessageCommand.COMMAND_NAME_LOWER_CASE,
                           MsgCheckerGetResponseMessageCommand.COMMAND_NAME_LOWER_CASE,
                           MsgCheckerSetDeleteMessageCommand.COMMAND_NAME_LOWER_CASE,
                           SetStarboardChannelCommand.COMMAND_NAME_LOWER_CASE,
                           GetStarboardChannelCommand.COMMAND_NAME_LOWER_CASE,
                           SetStarboardEmojiCommand.COMMAND_NAME_LOWER_CASE,
                           GetStarboardEmojiCommand.COMMAND_NAME_LOWER_CASE,
                           SetStarboardThresholdCommand.COMMAND_NAME_LOWER_CASE,
                           GetStarboardThresholdCommand.COMMAND_NAME_LOWER_CASE,
                           RotateImageCommand.COMMAND_NAME_LOWER_CASE]);

    public static descriptions: string[]
        = [CommandParser.EMPTY_STRING,
           ListCommandsCommand.DESCRIPTION,
           CommandParser.EMPTY_STRING,
           MsgCheckerListWordsCommand.DESCRIPTION,
           MsgCheckerAddWordCommand.DESCRIPTION,
           MsgCheckerRemoveWordCommand.DESCRIPTION,
           MsgCheckerSetReportChannelCommand.DESCRIPTION,
           MsgCheckerGetReportChannelCommand.DESCRIPTION,
           MsgCheckerSetResponseMessageCommand.DESCRIPTION,
           MsgCheckerGetResponseMessageCommand.DESCRIPTION,
           MsgCheckerSetDeleteMessageCommand.DESCRIPTION,
           CommandParser.EMPTY_STRING,
           SetStarboardChannelCommand.DESCRIPTION,
           GetStarboardChannelCommand.DESCRIPTION,
           SetStarboardEmojiCommand.DESCRIPTION,
           GetStarboardEmojiCommand.DESCRIPTION,
           SetStarboardThresholdCommand.DESCRIPTION,
           GetStarboardThresholdCommand.DESCRIPTION];

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
     * This function returns if the content was a command
     *
     * @param  {string} selfId self id of the bot itself
     * @returns boolean
     */
    public isCommand(selfId: string): boolean {
        // Check if bot is mentioned as the 1st word
        if (!(new RegExp(`<@!?${selfId}>`).test(this.splittedContent[0]))) {
            return false;
        }

        let command = this.splittedContent[1];
        command = command.toLowerCase();

        // Check if command word is the 2nd word
        if (!CommandParser.commandsLowerCase.has(command)) {
            return false;
        }

        if (CommandParser.notCommands.has(command)) {
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
     * This function executes the listword command
     * Returns the words in the server's banned list array
     *
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns {Command} Command object
     */
    public getCommand(): Command {
        const command = this.splittedContent[1].toLowerCase();
        const args = this.getArgs();
        switch (command) {
            case MsgCheckerListWordsCommand.COMMAND_NAME_LOWER_CASE:
                return new MsgCheckerListWordsCommand();
            case MsgCheckerSetReportChannelCommand.COMMAND_NAME_LOWER_CASE:
                return new MsgCheckerSetReportChannelCommand(args);
            case MsgCheckerAddWordCommand.COMMAND_NAME_LOWER_CASE:
                return new MsgCheckerAddWordCommand(args);
            case MsgCheckerRemoveWordCommand.COMMAND_NAME_LOWER_CASE:
                return new MsgCheckerRemoveWordCommand(args);
            case MsgCheckerGetReportChannelCommand.COMMAND_NAME_LOWER_CASE:
                return new MsgCheckerGetReportChannelCommand();
            case ListCommandsCommand.COMMAND_NAME_LOWER_CASE:
                return new ListCommandsCommand();
            case MsgCheckerSetResponseMessageCommand.COMMAND_NAME_LOWER_CASE:
                return new MsgCheckerSetResponseMessageCommand(args);
            case MsgCheckerGetResponseMessageCommand.COMMAND_NAME_LOWER_CASE:
                return new MsgCheckerGetResponseMessageCommand();
            case MsgCheckerSetDeleteMessageCommand.COMMAND_NAME_LOWER_CASE:
                return new MsgCheckerSetDeleteMessageCommand(args);
            case SetStarboardChannelCommand.COMMAND_NAME_LOWER_CASE:
                return new SetStarboardChannelCommand(args);
            case GetStarboardChannelCommand.COMMAND_NAME_LOWER_CASE:
                return new GetStarboardChannelCommand();
            case GetStarboardEmojiCommand.COMMAND_NAME_LOWER_CASE:
                return new GetStarboardEmojiCommand();
            case SetStarboardEmojiCommand.COMMAND_NAME_LOWER_CASE:
                return new SetStarboardEmojiCommand(args);
            case GetStarboardThresholdCommand.COMMAND_NAME_LOWER_CASE:
                return new GetStarboardThresholdCommand();
            case SetStarboardThresholdCommand.COMMAND_NAME_LOWER_CASE:
                return new SetStarboardThresholdCommand(args);
            case RotateImageCommand.COMMAND_NAME_LOWER_CASE:
                return new RotateImageCommand(args);
            default:
                throw new NoSuchCommandError(CommandParser.NO_SUCH_COMMAND);
        }
    }
}
