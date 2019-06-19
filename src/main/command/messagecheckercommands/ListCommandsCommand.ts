import { Command } from "../Command";
import { Permissions, Message, RichEmbed } from "discord.js";
import { Server } from "../../storage/Server";

export class ListCommandsCommand extends Command {
    static COMMAND_NAME = "help";
    static DESCRIPTION = "Displays all the available commands that this bot listens to."
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);

    private commands: string[];
    private descriptions: string[]

    constructor(commands: Set<string>, descriptions: string[]) {
        super();
        this.commands = Array.from(commands);
        this.descriptions = descriptions;
    }

    /**
     * This function lists out the commands that the bot will respond to.
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
        let embed = new RichEmbed();
        let output = "";
        for(let i in this.commands) {
            output += `**${this.commands[i]}** - ${this.descriptions[i]}\n`;
        }
        embed.setColor(this.EMBED_COLOUR);
        embed.addField("Commands", output);
        message.channel.send(embed);
    }
}