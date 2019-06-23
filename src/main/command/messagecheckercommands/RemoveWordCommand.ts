import { Command } from "../Command";
import { Permissions, Message, RichEmbed } from "discord.js";
import { Server } from "../../storage/Server";
import { CommandResult } from "../classes/CommandResult";

export class RemoveWordCommand extends Command {
    static COMMAND_NAME = "removewords";
    static DESCRIPTION = "Remove word(s) from the blacklist.";
    /** SaveServer: true, CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, false);
    private permissions = new Permissions(["KICK_MEMBERS", "BAN_MEMBERS"]);
    private args: string[];
    private REMOVED_WORDS = "✅Removed Word(s)";
    private MAYBE_WORDS_NOT_INSIDE = "Perhaps those word(s) are not inside the list?";
    private UNABLE_TO_REMOVE_WORDS = "❌Unable To Remove";

    constructor(args: string[]) {
        super();
        this.args = args;
    }
    
    /**
     * This function executes the removeword command
     * Removes the words in the server's banned list array
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

        //Execute
        let words = this.args;
        let wordsRemoved: string[] = [];
        let wordsNotRemoved: string[] = [];
        for(let word of words) {
            // Make word lowercase
            word = word.toLowerCase();
            if(server.messageCheckerSettings.removeBannedWord(word)) {
                wordsRemoved.push(word);
            } else {
                wordsNotRemoved.push(word);
            }
        }

        //Generate output embed
        let embed = new RichEmbed().setColor(this.EMBED_DEFAULT_COLOUR);
        if(wordsRemoved.length !== 0) {
            let output = "";
            for(let i = 0; i < wordsRemoved.length; i++) {
                output += wordsRemoved[i];
                output += "\n";
            }
            embed.addField(this.REMOVED_WORDS, output, false);
        }

        if(wordsNotRemoved.length !== 0) {
            let output = ""
            for(let i = 0; i < wordsNotRemoved.length; i++) {
                output += wordsNotRemoved[i];
                output += "\n";
            }
            output += this.MAYBE_WORDS_NOT_INSIDE;
            embed.addField(this.UNABLE_TO_REMOVE_WORDS, output, false);
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