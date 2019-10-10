import {
 Permissions, RichEmbed,
} from 'discord.js';
import { CommandResult } from './classes/CommandResult';
import { CommandArgs } from './classes/CommandArgs';

/** Base class of the Commands */
export abstract class Command {
    public static NO_ARGUMENTS = 'Oops! I received no arguments. Please try again.';

    public static EMBED_DEFAULT_COLOUR = '125bd1';

    public static EMBED_ERROR_COLOUR = 'ff0000';

    public static ERROR_EMBED_TITLE = '❌ Error';

    public static NO_PERMISSIONS_MSG = 'You do not have the permissions to do that!';

    public NO_PERMISSIONS_COMMANDRESULT = new CommandResult(false, true);

    
    /**
     * This function executes the command.
     * 
     * @param  {CommandArgs} commandArgs CommandArgs containing arguments that 
     *                                   a command may use.
     * @returns CommandResult
     */
    public abstract execute(commandArgs: CommandArgs): CommandResult;

    /**
     * This function checks if a given guildmember has the permissions required
     *
     * @param  {Permissions} commandPermissions Permissions of the command
     * @param  {Permissions} userPermissions Permissions of the user
     * @returns boolean
     */
    // eslint-disable-next-line class-methods-use-this
    public hasPermissions(commandPermissions: Permissions, userPermissions: Permissions): boolean {
        // Check if user permissions exist inside command permissions
        if (!userPermissions.has(commandPermissions)) {
            return false;
        }
        return true;
    }

    /**
     * This function sends the no permissions reply
     *
     * @param  {Function} messageReply
     * @returns void
     */
    // eslint-disable-next-line class-methods-use-this
    protected sendNoPermissionsMessage(messageReply: Function): void {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR)
            .addField(Command.ERROR_EMBED_TITLE, Command.NO_PERMISSIONS_MSG);

        messageReply(embed);
    }
}
