import { Command } from "../Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";
import { CommandResult } from "../CommandResult";

export class SetResponseMessageCommand extends Command {
    static COMMAND_NAME = "setresponsemessage";
    static DESCRIPTION = "Sets the response message to the user upon detection of blacklisted words for this server.";
    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];

    constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the setresponsemessage command
     * Sets the response message for the server.
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

        if(this.args.length === 0) {
            server.messageCheckerSettings.setResponseMessage(undefined);
            message.channel.send("Response Message has been resetted.");
        } else {
            let msg = "";
            for(let i = 0; i < this.args.length; i++) {
                msg += this.args[i];
                msg += (i !== this.args.length - 1) ? " " : "";
            }
            server.messageCheckerSettings.setResponseMessage(msg);
            message.channel.send(`Response Message set to ${msg}`);
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT
    }
}