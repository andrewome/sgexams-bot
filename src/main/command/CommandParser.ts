import { Command, CommandClassRef } from './Command';
import { NoSuchCommandError } from './error/NoSuchCommandError';
import { CommandCollection } from './classes/CommandCollection';

export class CommandParser {
    public static NO_SUCH_COMMAND = 'No such command!';

    /** Map of command name (lowercased) -> command class references */
    public static commands = new Map<string, CommandClassRef>(
        [
            ...CommandCollection.HELP_COMMANDS,
            ...CommandCollection.MSGCHECKER_COMMANDS,
            ...CommandCollection.MISC_COMMANDS,
            ...CommandCollection.STARBOARD_COMMANDS,
            ...CommandCollection.MODERATION_COMMANDS,
            ...CommandCollection.BIRTHDAY_COMMANDS,
        ].map((command) => [command.NAME.toLowerCase(), command]),
    );

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
        if (!new RegExp(`<@!?${selfId}>`).test(this.splittedContent[0])) {
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
        if (!CommandParser.commands.has(command)) {
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
        if (!CommandParser.commands.has(command)) {
            throw new NoSuchCommandError(CommandParser.NO_SUCH_COMMAND);
        }
        return new (CommandParser.commands.get(command)!)(args);
    }
}
