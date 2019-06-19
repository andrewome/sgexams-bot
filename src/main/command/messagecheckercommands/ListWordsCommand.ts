import { Command } from "../Command";
import { Permissions, Message, RichEmbed } from "discord.js";
import { Server } from "../../storage/Server";

export class ListWordsCommand extends Command {
    static COMMAND_NAME = "listwords";
    static DESCRIPTION = "Displays all blacklisted words.";
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private NO_WORDS_FOUND = "There are no words set for this server!";

    /**
     * This function executes the list words command.
     * Lists out all the banned words that the server has.
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
        let bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.sort();
        if(bannedWords.length === 0) {
            message.channel.send(this.NO_WORDS_FOUND);
        } else {
            let embed = new RichEmbed();
            let output = "";
            for(let word of bannedWords) {
                output += word + "\n";
            }
            embed.setColor(this.EMBED_COLOUR);
            embed.addField("Blacklisted Words", output);
            message.channel.send(embed);
        }
    }
}