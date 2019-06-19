import { Command } from "../Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";

export class SetChannelCommand extends Command {
    static COMMAND_NAME = "setchannel";
    static DESCRIPTION = "Sets the reporting channel to post incident reports for this server when blacklisted words are used.";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];
    private CHANNEL_NOT_FOUND = "Channel was not found. Please submit a valid channel ID.";
    private NOT_TEXT_CHANNEL = "Channel is not a Text Channel. Make sure the Channel you are submitting is a Text Channel";

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
        if(this.args.length === 0) {
            server.messageCheckerSettings.setReportingChannelId(undefined);
            message.channel.send("Reporting Channel has been resetted. Please set a new one.");
        } else {
            let channelId = this.args[0];

            // Check if valid channel
            const channel = message.guild.channels.get(channelId);
            if(typeof channel === "undefined") {
                message.channel.send(this.CHANNEL_NOT_FOUND);
            } else if (channel.type !== "text") {
                message.channel.send(this.NOT_TEXT_CHANNEL);
            } else {
                server.messageCheckerSettings.setReportingChannelId(channelId);
                message.channel.send(`Reporting Channel set to <#${channelId}>.`);
            }
        }
    }
}