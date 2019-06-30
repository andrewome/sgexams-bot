import { Permissions, Message, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class ListWordsCommand extends Command {
    public static COMMAND_NAME = 'ListWords';

    public static COMMAND_NAME_LOWER_CASE = 'listwords';

    public static DESCRIPTION = 'Displays all blacklisted words.';

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
    public execute(server: Server, message: Message): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, message.member.permissions)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute Command
        message.channel.send(this.generateEmbed(server));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed that is sent back to user
     *
     * @param  {Server} server
     * @returns RichEmbed
     */
    /* eslint-disable class-methods-use-this */
    public generateEmbed(server: Server): RichEmbed {
        const bannedWords = server.messageCheckerSettings.getBannedWords();
        bannedWords.sort();

        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (bannedWords.length === 0) {
            embed.addField(ListWordsCommand.EMBED_TITLE, ListWordsCommand.NO_WORDS_FOUND);
        } else {
            let output = '';
            for (const word of bannedWords) {
                output += `${word}\n`;
            }
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(ListWordsCommand.EMBED_TITLE, output);
        }
        return embed;
    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    public changeServerSettings(server: Server, ...args: any): void {
        throw new Error(Command.THIS_METHOD_SHOULD_NOT_BE_CALLED);
    }
    /* eslint-enable class-methods-use-this */
}
