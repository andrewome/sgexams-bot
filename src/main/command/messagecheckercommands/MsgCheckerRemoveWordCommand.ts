import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerRemoveWordCommand extends Command {
    public static REMOVED_WORDS = '✅Removed Word(s)';

    public static MAYBE_WORDS_NOT_INSIDE = 'Perhaps those word(s) are not inside the list?';

    public static UNABLE_TO_REMOVE_WORDS = '❌Unable To Remove';

    /** SaveServer: true, CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, false);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the removeword command
     * Removes the words in the server's banned list array
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const { server, memberPerms, messageReply } = commandArgs;
        
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        const wordsRemoved: string[] = [];
        const wordsNotRemoved: string[] = [];
        this.changeServerSettings(server, wordsRemoved, wordsNotRemoved);

        // Generate output embed
        const embed = this.generateEmbed(wordsRemoved, wordsNotRemoved);

        // Send output
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates output embed to be sent back to user.
     *
     * @param  {string[]} wordsRemoved Words successfully removed
     * @param  {string[]} wordsNotRemoved Words unsuccessfully removed
     * @returns RichEmbed
     */
    public generateEmbed(wordsRemoved: string[],
        wordsNotRemoved: string[]): RichEmbed {
        let embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        const words = this.args;
        if (wordsRemoved.length !== 0) {
            let output = '';
            for (let i = 0; i < wordsRemoved.length; i++) {
                output += wordsRemoved[i];
                output += '\n';
            }
            embed.addField(MsgCheckerRemoveWordCommand.REMOVED_WORDS, output, false);
        }

        if (wordsNotRemoved.length !== 0) {
            let output = '';
            for (let i = 0; i < wordsNotRemoved.length; i++) {
                output += wordsNotRemoved[i];
                output += '\n';
            }
            output += MsgCheckerRemoveWordCommand.MAYBE_WORDS_NOT_INSIDE;
            embed.addField(MsgCheckerRemoveWordCommand.UNABLE_TO_REMOVE_WORDS, output, false);
        }

        if (words.length === 0) {
            embed = new RichEmbed()
                .setColor(Command.EMBED_ERROR_COLOUR)
                .addField(Command.ERROR_EMBED_TITLE,
                    MsgCheckerRemoveWordCommand.NO_ARGUMENTS);
        }

        return embed;
    }

    /**
     * Changed the settings of server object
     *
     * @param  {Server} server the discord server
     * @param  {string[]} wordsRemoved Words successfully removed
     * @param  {string[]} wordsNotRemoved Words unsuccessfully removed
     * @returns void
     */
    public changeServerSettings(server: Server,
                                wordsRemoved: string[],
                                wordsNotRemoved: string[]): void {
        const words = this.args;
        for (let word of words) {
            // Make word lowercase
            word = word.toLowerCase();
            if (server.messageCheckerSettings.removeBannedWord(word)) {
                wordsRemoved.push(word);
            } else {
                wordsNotRemoved.push(word);
            }
        }
    }
}
