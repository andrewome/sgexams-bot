import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerListWordsCommand extends Command {
    public static NO_WORDS_FOUND = 'There are no words set for this server!';

    public static EMBED_TITLE = 'Blacklisted Words';

    public static readonly NAME = 'MsgCheckerListWords';

    public static readonly DESCRIPTION = 'Displays all blacklisted words.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the list words command.
     * Lists out all the banned words that the server has.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { server, memberPerms, messageReply } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Generate embed
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.sort();

        let embed: MessageEmbed;
        if (bannedWords.length === 0) {
            embed = this.generateGenericEmbed(
                MsgCheckerListWordsCommand.EMBED_TITLE,
                MsgCheckerListWordsCommand.NO_WORDS_FOUND,
                MsgCheckerListWordsCommand.EMBED_DEFAULT_COLOUR,
            );
        } else {
            let output = '';
            for (const word of bannedWords) {
                output += `${word}\n`;
            }
            embed = this.generateGenericEmbed(
                MsgCheckerListWordsCommand.EMBED_TITLE,
                output,
                MsgCheckerListWordsCommand.EMBED_DEFAULT_COLOUR,
            );
        }

        // Send reply
        await messageReply({ embeds: [embed] });
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
