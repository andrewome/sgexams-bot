import { Command } from "./Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";

export class ListWordsCommand extends Command {
    static COMMAND_NAME = "listwords";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    /**
     * 
     * 
     * @param  {Server} server
     * @param  {Message} message
     * @returns void
     */
    public execute(server: Server, message: Message): void {
        //Check for permissions first
        if(!this.hasPermissions(this.permissions, message.member)) {
            return;
        }

        //Execute Command
        message.reply(server.getBannedWords().toString());
    }
}