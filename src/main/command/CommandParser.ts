import { Command } from "./commands/Command";
import { ListWordsCommand } from "./commands/ListWordsCommand";
import { SetChannelCommand } from "./commands/SetChannelCommand";
import { AddWordCommand } from "./commands/AddWordCommand";
import { RemoveWordCommand } from "./commands/RemoveWordCommand";
import { NoSuchCommandError } from "./error/NoSuchCommandError";
import { GetChannelCommand } from "./commands/GetChannelCommand";
import { ListCommandsCommand } from "./commands/ListCommandsCommand";

const HELP = "help"
export class CommandParser {
    private commands: Set<string> = new Set<string>([ListWordsCommand.COMMAND_NAME,
                                                     SetChannelCommand.COMMAND_NAME,
                                                     AddWordCommand.COMMAND_NAME,
                                                     RemoveWordCommand.COMMAND_NAME,
                                                     GetChannelCommand.COMMAND_NAME,
                                                     ListCommandsCommand.COMMAND_NAME,
                                                     HELP]);
    private content: string;
    private splittedContent: string[];

    /**
     * Constructor, takes in content and gets the splitted content
     * splitted by ' ' and ','
     * 
     * @param  {string} content
     */
    constructor(content: string) {
        this.content = content.toLowerCase();
        this.splittedContent = content.split(/ +|,+/g);
    }

    /**
     * This function returns if the content was a command
     * 
     * @param  {string} selfId self id of the bot itself
     * @returns boolean
     */
    public isCommand(selfId: string): boolean {

        //Check if bot is mentioned as the 1st word
        if(!(new RegExp(`<@!?${selfId}>`).test(this.splittedContent[0]))) {
            return false;
        }

        //Check if command word is the 2nd word
        if(!this.commands.has(this.splittedContent[1])) {
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
        let length = this.splittedContent.length;
        if(length > 1) {
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
        const command = this.splittedContent[1];
        const args = this.getArgs();
        switch(command) {
            case ListWordsCommand.COMMAND_NAME:
                return new ListWordsCommand();
            case SetChannelCommand.COMMAND_NAME:
                return new SetChannelCommand(args);
            case AddWordCommand.COMMAND_NAME:
                return new AddWordCommand(args);
            case RemoveWordCommand.COMMAND_NAME:
                return new RemoveWordCommand(args);
            case GetChannelCommand.COMMAND_NAME:
                return new GetChannelCommand();
            case ListCommandsCommand.COMMAND_NAME:
                return new ListCommandsCommand(this.commands);
            case HELP:
                return new ListCommandsCommand(this.commands);
        }
        throw new NoSuchCommandError("No such command!");
    }
}