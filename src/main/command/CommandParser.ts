import { Command } from './Command';
import { ListWordsCommand } from './messagecheckercommands/ListWordsCommand';
import { SetReportChannelCommand } from './messagecheckercommands/SetReportChannelCommand';
import { AddWordCommand } from './messagecheckercommands/AddWordCommand';
import { RemoveWordCommand } from './messagecheckercommands/RemoveWordCommand';
import { NoSuchCommandError } from './error/NoSuchCommandError';
import { GetReportChannelCommand } from './messagecheckercommands/GetReportChannelCommand';
import { ListCommandsCommand } from './generalcommands/ListCommandsCommand';
import { SetResponseMessageCommand } from './messagecheckercommands/SetResponseMessageCommand';
import { GetResponseMessageCommand } from './messagecheckercommands/GetResponseMessageCommand';
import { SetDeleteMessageCommand } from './messagecheckercommands/SetDeleteMessageCommand';

export class CommandParser {
    public static EMPTY_STRING = '\u200b';

    public static GENERAL_COMMANDS_HEADER = '__General Commands__';

    public static MESSAGE_CHECKER_COMMANDS_HEADER = '__Message Checker Commands__';

    public static NO_SUCH_COMMAND = 'No such command!';

    public static notCommands: Set<string>
        = new Set<string>([CommandParser.GENERAL_COMMANDS_HEADER.toLowerCase(),
                           CommandParser.MESSAGE_CHECKER_COMMANDS_HEADER.toLowerCase()]);

    public static commands: Set<string>
        = new Set<string>([CommandParser.GENERAL_COMMANDS_HEADER,
                           ListCommandsCommand.COMMAND_NAME,
                           CommandParser.MESSAGE_CHECKER_COMMANDS_HEADER,
                           ListWordsCommand.COMMAND_NAME,
                           AddWordCommand.COMMAND_NAME,
                           RemoveWordCommand.COMMAND_NAME,
                           SetReportChannelCommand.COMMAND_NAME,
                           GetReportChannelCommand.COMMAND_NAME,
                           SetResponseMessageCommand.COMMAND_NAME,
                           GetResponseMessageCommand.COMMAND_NAME,
                           SetDeleteMessageCommand.COMMAND_NAME]);

    public static descriptions: string[]
        = [CommandParser.EMPTY_STRING,
           ListCommandsCommand.DESCRIPTION,
           CommandParser.EMPTY_STRING,
           ListWordsCommand.DESCRIPTION,
           AddWordCommand.DESCRIPTION,
           RemoveWordCommand.DESCRIPTION,
           SetReportChannelCommand.DESCRIPTION,
           GetReportChannelCommand.DESCRIPTION,
           SetResponseMessageCommand.DESCRIPTION,
           GetResponseMessageCommand.DESCRIPTION,
           SetDeleteMessageCommand.DESCRIPTION];

    public static commandsLowerCase: Set<string>
        = new Set<string>([CommandParser.GENERAL_COMMANDS_HEADER,
                           ListCommandsCommand.COMMAND_NAME_LOWER_CASE,
                           CommandParser.MESSAGE_CHECKER_COMMANDS_HEADER,
                           ListWordsCommand.COMMAND_NAME_LOWER_CASE,
                           AddWordCommand.COMMAND_NAME_LOWER_CASE,
                           RemoveWordCommand.COMMAND_NAME_LOWER_CASE,
                           SetReportChannelCommand.COMMAND_NAME_LOWER_CASE,
                           GetReportChannelCommand.COMMAND_NAME_LOWER_CASE,
                           SetResponseMessageCommand.COMMAND_NAME_LOWER_CASE,
                           GetResponseMessageCommand.COMMAND_NAME_LOWER_CASE,
                           SetDeleteMessageCommand.COMMAND_NAME_LOWER_CASE]);

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
     * @returns void
     */
    public getCommand(): Command {
        const command = this.splittedContent[1].toLowerCase();
        const args = this.getArgs();
        switch (command) {
            case ListWordsCommand.COMMAND_NAME_LOWER_CASE:
                return new ListWordsCommand();
            case SetReportChannelCommand.COMMAND_NAME_LOWER_CASE:
                return new SetReportChannelCommand(args);
            case AddWordCommand.COMMAND_NAME_LOWER_CASE:
                return new AddWordCommand(args);
            case RemoveWordCommand.COMMAND_NAME_LOWER_CASE:
                return new RemoveWordCommand(args);
            case GetReportChannelCommand.COMMAND_NAME_LOWER_CASE:
                return new GetReportChannelCommand();
            case ListCommandsCommand.COMMAND_NAME_LOWER_CASE:
                return new ListCommandsCommand();
            case SetResponseMessageCommand.COMMAND_NAME_LOWER_CASE:
                return new SetResponseMessageCommand(args);
            case GetResponseMessageCommand.COMMAND_NAME_LOWER_CASE:
                return new GetResponseMessageCommand();
            case SetDeleteMessageCommand.COMMAND_NAME_LOWER_CASE:
                return new SetDeleteMessageCommand(args);
            default:
                throw new NoSuchCommandError(CommandParser.NO_SUCH_COMMAND);
        }
    }
}
