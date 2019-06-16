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
        for(let word of words) {
            server.addbannedWord(word);
        }
        message.reply(`Added word(s): ${words}`);
    }
}