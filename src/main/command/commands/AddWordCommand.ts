import { Command } from "./Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";

export class AddWordCommand extends Command {
    static COMMAND_NAME = "addwords";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];
    
    constructor(args: string[]) {
        super();
        this.args = args;
    }
    
    /**
     * This function executes the addword command
     * Adds word(s) to the banned list array of the server
     * 
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns void
     */
    public execute(server: Server, message: Message): void {
        //Check for permissions first
        if(!this.hasPermissions(this.permissions, message.member)) {
            return;
        }

        //Execute
        let words = this.args;
        let wordsAdded: string[] = [];
        let wordsNotAdded: string[] = [];
        for(let word of words) {
            if(server.addbannedWord(word)) {
                wordsAdded.push(word);
            } else {
                wordsNotAdded.push(word);
            }
        }

        //Generate output string
        let output = "";
        if(wordsAdded.length !== 0) {
            output += "✅ Added: ";
            for(let i = 0; i < wordsAdded.length; i++) {
                output += wordsAdded[i];
                output += (i === wordsAdded.length - 1) ? "\n" : ", ";
            }
        }

        if(wordsNotAdded.length !== 0) {
            output += "❌ Unable to add: ";
            for(let i = 0; i < wordsNotAdded.length; i++) {
                output += wordsNotAdded[i];
                output += (i === wordsNotAdded.length - 1) ? "\n" : ", ";
            }
            output += "Perhaps those word(s) are already added?";
        }

        if(words.length === 0) {
            output += this.NO_ARGUMENTS;
        }

        //Send output
        message.channel.send(output);
    }
}