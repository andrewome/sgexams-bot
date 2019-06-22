import { Command } from "../Command";
import { Permissions, Message, RichEmbed } from "discord.js";
import { Server } from "../../storage/Server";
import { CommandResult } from "../CommandResult";

export class ListWordsCommand extends Command {
    static COMMAND_NAME = "listwords";
    static DESCRIPTION = "Displays all blacklisted words.";
    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private NO_WORDS_FOUND = "There are no words set for this server!";

    /**
     * This function executes the list words command.
     * Lists out all the banned words that the server has.
     * 
     * @param  {Server} server
     * @param  {Message} message
     * @returns CommandResult
     */
    public execute(server: Server, message: Message): CommandResult {
        //Check for permissions first
        if(!this.hasPermissions(this.permissions, message.member)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
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
        
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}