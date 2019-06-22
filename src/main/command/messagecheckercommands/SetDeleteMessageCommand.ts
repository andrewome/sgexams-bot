import { Command } from "../Command";
import { Permissions, Message, RichEmbed } from "discord.js";
import { Server } from "../../storage/Server";
import { CommandResult } from "../classes/CommandResult";

export class SetDeleteMessageCommand extends Command {
    static COMMAND_NAME = "setdeletemessage";
    static DESCRIPTION = "Sets whether the bot should delete instances of blacklisted words being used.";
    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);
    /** SaveServer: false, CheckMessage: true */
    private COMMAND_UNSUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];
    private INCORRECT_FORMAT = "Incorrect format. Use only \"true\" or \"false\"."
    private EMBED_TITLE = "Delete Message";

    constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the setdeletemessage command
     * Sets the delete message boolean for the server.
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

        let embed = new RichEmbed()
        if(this.args.length === 0) {
            embed.setColor(this.EMBED_ERROR_COLOUR);
            embed.addField(this.EMBED_TITLE, this.NO_ARGUMENTS);
            message.channel.send(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT
        } else {
            const boolStr = this.args[0].toLowerCase();
            const trueFalseRegex = new RegExp(/\btrue\b|\bfalse\b/, "g");
            if(!trueFalseRegex.test(boolStr)) {
                embed.setColor(this.EMBED_ERROR_COLOUR);
                embed.addField(this.EMBED_TITLE, this.INCORRECT_FORMAT);
                message.channel.send(embed);
                return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
            }

            if(boolStr === "true") {
                server.messageCheckerSettings.setDeleteMessage(true);
            }

            if(boolStr === "false") {
                server.messageCheckerSettings.setDeleteMessage(false);
            }
            let msg = `Delete Message set to: **${boolStr.toUpperCase()}**`;
            embed.setColor(this.EMBED_DEFAULT_COLOUR);
            embed.addField(this.EMBED_TITLE, msg);
            message.channel.send(embed);
            
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }
    }
}