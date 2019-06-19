import { Command } from "../Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";

export class GetChannelCommand extends Command {
    static COMMAND_NAME = "getchannel";
    static DESCRIPTION = "Displays the reporting channel to post incident reports for this server when blacklisted words are used.";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private CHANNEL_NOT_SET = "There is no reporting channel set for this server.";

    constructor() {
        super();
    }

    /**
     * This function executes the getchannel command
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
        let channelId = server.messageCheckerSettings.getReportingChannelId();
        if(typeof channelId === "undefined") {
            message.channel.send(this.CHANNEL_NOT_SET);
        } else {
            message.channel.send(`Reporting Channel is currently set to <#${channelId}>.`);
        }
    }
}