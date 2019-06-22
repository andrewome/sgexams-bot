import { Command } from "../Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";
import { CommandResult } from "../CommandResult";

export class RemoveWordCommand extends Command {
    static COMMAND_NAME = "removewords";
    static DESCRIPTION = "Remove word(s) from the blacklist.";
    /** SaveServer: true, CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, false);
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];

    constructor(args: string[]) {
        super();
        this.args = args;
    }
    
    /**
     * This function executes the removeword command
     * Removes the words in the server's banned list array
     * 
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns CommandResult
     */
    public execute(server: Server, message: Message): CommandResult {
        //Check for permissions first
        if(!this.hasPermissions(this.permissions, message.member)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        //Execute
        let words = this.args;
        let wordsRemoved: string[] = [];
        let wordsNotRemoved: string[] = [];
        for(let word of words) {
            if(server.messageCheckerSettings.removeBannedWord(word)) {
                wordsRemoved.push(word);
            } else {
                wordsNotRemoved.push(word);
            }
        }

        //Generate output string
        let output = "";
        if(wordsRemoved.length !== 0) {
            output += "✅ Removed: ";
            for(let i = 0; i < wordsRemoved.length; i++) {
                output += wordsRemoved[i];
                output += (i === wordsRemoved.length - 1) ? "\n" : ", ";
            }
        }

        if(wordsNotRemoved.length !== 0) {
            output += "❌ Unable to remove: ";
            for(let i = 0; i < wordsNotRemoved.length; i++) {
                output += wordsNotRemoved[i];
                output += (i === wordsNotRemoved.length - 1) ? "\n" : ", ";
            }
            output += "Perhaps those word(s) are not inside the list?";
        }
 
        if(words.length === 0) {
            output += this.NO_ARGUMENTS;
        }

        //Send output
        message.channel.send(output);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}