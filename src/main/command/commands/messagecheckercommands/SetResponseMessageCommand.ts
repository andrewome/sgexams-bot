import { Command } from "../Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../../storage/Server";

export class SetResponseMessageCommand extends Command {
    static COMMAND_NAME = "setresponsemessage";
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
     * @returns void
     */
    public execute(server: Server, message: Message): void {
        //Check for permissions first
        if(!this.hasPermissions(this.permissions, message.member)) {
            return;
        }

        if(this.args.length === 0) {
            message.channel.send(this.NO_ARGUMENTS);
        } else {
            let msg = "";
            for(let i = 0; i < this.args.length; i++) {
                msg += this.args[i];
                msg += (i !== this.args.length - 1) ? " " : "";
            }
            server.messageCheckerSettings.setResponseMessage(msg);
            message.channel.send(`Response Message set to ${msg}`);
        }
    }
}