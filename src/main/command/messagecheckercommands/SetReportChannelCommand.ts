import { Command } from "../Command";
import { Permissions, Message, RichEmbed } from "discord.js";
import { Server } from "../../storage/Server";
import { CommandResult } from "../CommandResult";

export class SetReportChannelCommand extends Command {
    static COMMAND_NAME = "setreportchannel";
    static DESCRIPTION = "Sets the reporting channel to post incident reports for this server when blacklisted words are used.";
    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];
    private CHANNEL_NOT_FOUND = "Channel was not found. Please submit a valid channel ID.";
    private NOT_TEXT_CHANNEL = "Channel is not a Text Channel. Make sure the Channel you are submitting is a Text Channel";
    private EMBED_TITLE = "Reporting Channel";
    private CHANNEL_RESETTED = "Reporting Channel has been resetted because there was no arguments. Please set a new one.";

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
     * @returns CommandResult
     */
    public execute(server: Server, message: Message): CommandResult {
        //Check for permissions first
        if(!this.hasPermissions(this.permissions, message.member)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        //Execute
        let embed = new RichEmbed();
        if(this.args.length === 0) {
            server.messageCheckerSettings.setReportingChannelId(undefined);
            embed.setColor(this.EMBED_DEFAULT_COLOUR);
            embed.addField(this.EMBED_TITLE, this.CHANNEL_RESETTED);
        } else {
            let channelId = this.args[0];

            // Check if valid channel
            const channel = message.guild.channels.get(channelId);
            if(typeof channel === "undefined") {
                embed.setColor(this.EMBED_ERROR_COLOUR);
                embed.addField(this.EMBED_TITLE, this.CHANNEL_NOT_FOUND);
            } else if (channel.type !== "text") {
                embed.setColor(this.EMBED_ERROR_COLOUR);
                embed.addField(this.EMBED_TITLE, this.NOT_TEXT_CHANNEL);
            } else {
                server.messageCheckerSettings.setReportingChannelId(channelId);
                let msg = `Reporting Channel set to <#${channelId}>.`;
                embed.setColor(this.EMBED_DEFAULT_COLOUR);
                embed.addField(this.EMBED_TITLE, msg);
            }
        }
        message.channel.send(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}