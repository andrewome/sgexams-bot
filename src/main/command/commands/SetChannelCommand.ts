import { Command } from "./Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";

export class SetChannelCommand extends Command {
    static COMMAND_NAME = "setchannel";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];

    constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the setchannel command
     * Sets the reporting channel of the server.
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
        let channelId = this.args[0];
        server.setReportingChannelId(channelId);
        message.reply(`Reporting Channel set at <#${channelId}>.`);
    }
}