import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerRemoveWordCommand extends Command {
    public static REMOVED_WORDS = 'Removed Word(s)';

    public static MAYBE_WORDS_NOT_INSIDE = 'Perhaps those word(s) are not inside the list?';

    public static UNABLE_TO_REMOVE_WORDS = 'Unable To Remove';

    /** CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false);

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
        const { wordsRemoved, wordsNotRemoved } = this.changeServerSettings(server);

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
                         wordsNotRemoved: string[]): MessageEmbed {
        let embed = new MessageEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
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
            embed = new MessageEmbed()
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
     * @returns any An object comprising 2 lists, one of the words removed and
     *              one of those not removed
     */
    public changeServerSettings(server: Server): {
        wordsRemoved: string[]; wordsNotRemoved: string[];
    } {
        const words = this.args.map((word) => word.toLowerCase());
        const res = server.messageCheckerSettings.removeBannedWords(words);
        return res;
    }
}
