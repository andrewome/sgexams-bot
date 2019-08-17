import {
 Permissions, Collection, Channel, Emoji,
} from 'discord.js';
import { Server } from '../storage/Server';
import { CommandResult } from './classes/CommandResult';
import { RotateImageCommandData } from './rotateimagecommands/RotateImageCommandData';

/** Base class of the Commands */
export abstract class Command {
    public static NO_ARGUMENTS = 'Oops! I received no arguments. Please try again.';

    public static EMBED_DEFAULT_COLOUR = '125bd1';

    public static EMBED_ERROR_COLOUR = 'ff0000';

    public static ERROR_EMBED_TITLE = '❌ Error';

    public NO_PERMISSIONS_COMMANDRESULT = new CommandResult(false, true);

    /**
     * Each command class must implement an execute method.
     *
     * @param  {Server} server Server storage class
     * @param  {Message} message Discord Message from message event
     * @returns CommandResult
     */
    public abstract execute(server: Server,
                            memberPerms: Permissions,
                            messageReply: Function,
                            ...args:
                            (Collection<string, Channel> |
                             Collection<string, Emoji> |
                             RotateImageCommandData)[]
                            ): CommandResult;

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
}
