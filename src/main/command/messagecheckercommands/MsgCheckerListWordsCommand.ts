import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class MsgCheckerListWordsCommand extends Command {
    public static NO_WORDS_FOUND = 'There are no words set for this server!';

    public static EMBED_TITLE = 'Blacklisted Words';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the list words command.
     * Lists out all the banned words that the server has.
     *
     * @param  {Server} server
     * @param  {Message} message
     * @returns CommandResult
     */
    public execute(server: Server,
                   memberPerms: Permissions,
                   messageReply: Function): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Generate embed
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.sort();

        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (bannedWords.length === 0) {
            embed.addField(
                MsgCheckerListWordsCommand.EMBED_TITLE,
                MsgCheckerListWordsCommand.NO_WORDS_FOUND,
            );
        } else {
            let output = '';
            for (const word of bannedWords) {
                output += `${word}\n`;
            }
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(MsgCheckerListWordsCommand.EMBED_TITLE, output);
        }

        // Execute Command
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
