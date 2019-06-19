import { Command } from "../Command";
import { Permissions, Message } from "discord.js";
import { Server } from "../../storage/Server";

export class GetResponseMessageCommand extends Command {
    static COMMAND_NAME = "getresponsemessage";
    static DESCRIPTION = "Displays the response message to the user upon detection of blacklisted words for this server.";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private CHANNEL_NOT_SET = "There is no message set for this server.";

    constructor() {
        super();
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
        let responseMessage = server.messageCheckerSettings.getResponseMessage();
        if(typeof responseMessage === "undefined") {
            message.channel.send(this.CHANNEL_NOT_SET);
        } else {
            message.channel.send(`Response message is ${responseMessage}.`);
        }
    }
}