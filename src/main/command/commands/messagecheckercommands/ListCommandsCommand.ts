import { Command } from "../Command";
import { Permissions, Message, RichEmbed } from "discord.js";
import { Server } from "../../../storage/Server";

export class ListCommandsCommand extends Command {
    static COMMAND_NAME = "help";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);

    private commands: Set<string>;

    constructor(commands: Set<string>) {
        super();
        this.commands = commands;
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
        for(let command of Array.from(this.commands).sort()) {
            output += command + "\n";
        }
        embed.setColor("#125bd1");
        embed.addField("Commands", output);
        message.channel.send(embed);
    }
}