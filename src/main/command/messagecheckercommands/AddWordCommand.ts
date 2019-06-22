import { Command } from "../Command";
import { Permissions, Message, RichEmbed } from "discord.js";
import { Server } from "../../storage/Server";
import { CommandResult } from "../CommandResult";

export class AddWordCommand extends Command {
    static COMMAND_NAME = "addwords";
    static DESCRIPTION = "Add word(s) to the blacklist.";
    /** SaveServer: true, CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, false);
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];
    
    constructor(args: string[]) {
        super();
        this.args = args;
    }
    
    /**
     * This function executes the addword command
     * Adds word(s) to the banned list array of the server
     * 
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns CommandResult 
     */
    public execute(server: Server, message: Message): CommandResult {
        //Check for permissions first
        if(!this.hasPermissions(this.permissions, message.member)) {
            return this.NO_PERMISSIONS_COMMANDRESULT
        }

        //Execute
        let words = this.args;
        let wordsAdded: string[] = [];
        let wordsNotAdded: string[] = [];
        for(let word of words) {
            if(server.messageCheckerSettings.addbannedWord(word)) {
                wordsAdded.push(word);
            } else {
                wordsNotAdded.push(word);
            }
        }

        //Generate output embed
        let embed = new RichEmbed().setColor(this.EMBED_DEFAULT_COLOUR);
        if(wordsAdded.length !== 0) {
            let output = "";
            for(let i = 0; i < wordsAdded.length; i++) {
                output += wordsAdded[i];
                output += "\n";
            }
            embed.addField("✅Added Words:", output, false);
        }

        if(wordsNotAdded.length !== 0) {
            let output = ""
            for(let i = 0; i < wordsNotAdded.length; i++) {
                output += wordsNotAdded[i];
                output += "\n";
            }
            output += "Perhaps those word(s) are already added?";
            embed.addField("❌Unable To Add:", output, false);
        }

        if(words.length === 0) {
            embed = new RichEmbed()
                .setColor(this.EMBED_ERROR_COLOUR)
                .addField(this.ERROR_EMBED_TITLE, this.NO_ARGUMENTS);
        }

        //Send output
        message.channel.send(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}