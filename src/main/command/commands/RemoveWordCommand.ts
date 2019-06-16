import { Command } from "./Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";

export class RemoveWordCommand extends Command {
    static COMMAND_NAME = "removewords";
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
            server.removeBannedWord(word);
        }
        message.reply(`Removed word(s): ${words}`);
    }
}