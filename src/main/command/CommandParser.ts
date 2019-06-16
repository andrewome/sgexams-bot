import { Command } from "./commands/Command";
import { ListWordsCommand } from "./commands/ListWordsCommand";
import { SetChannelCommand } from "./commands/SetChannelCommand";
import { AddWordCommand } from "./commands/AddWordCommand";
import { RemoveWordCommand } from "./commands/RemoveWordCommand";
import { NoSuchCommandError } from "./error/NoSuchCommandError";

export class CommandParser {
    private commands: Set<string> = new Set<string>([ListWordsCommand.COMMAND_NAME,
                                                     SetChannelCommand.COMMAND_NAME,
                                                     AddWordCommand.COMMAND_NAME,
                                                     RemoveWordCommand.COMMAND_NAME]);
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
        if(this.splittedContent[0] !== `<@${selfId}>`) {
            return false;
        }

        //Check if command word is the 2nd word
        if(!this.commands.has(this.splittedContent[1])) {
            console.log(this.splittedContent[1]);
            console.log(this.commands);
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
        switch(command) {
            case ListWordsCommand.COMMAND_NAME:
                return new ListWordsCommand();
            case SetChannelCommand.COMMAND_NAME:
                return new SetChannelCommand(this.getArgs());
            case AddWordCommand.COMMAND_NAME:
                return new AddWordCommand(this.getArgs());
            case RemoveWordCommand.COMMAND_NAME:
                return new RemoveWordCommand(this.getArgs());
        }
        throw new NoSuchCommandError("No such command!");
    }
}