import { Command } from "../Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../../storage/Server";

export class SetDeleteMessageCommand extends Command {
    static COMMAND_NAME = "setdeletemessage";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];
    private INCORRECT_FORMAT = "Incorrect format. Use only \"true\" or \"false\"."

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
            const boolStr = this.args[0].toLowerCase();
            const trueFalseRegex = new RegExp(/\btrue\b|\bfalse\b/, "g");
            if(!trueFalseRegex.test(boolStr)) {
                message.channel.send(this.INCORRECT_FORMAT);
                return;
            }

            if(boolStr === "true") {
                server.messageCheckerSettings.setDeleteMessage(true);
            }

            if(boolStr === "false") {
                server.messageCheckerSettings.setDeleteMessage(false);
            }

            message.channel.send(`Delete Message set to: **${boolStr.toUpperCase()}**`);
        }
    }
}