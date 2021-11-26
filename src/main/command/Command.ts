import {
    Permissions, MessageEmbed, ColorResolvable,
} from 'discord.js';
import { CommandResult } from './classes/CommandResult';
import { CommandArgs } from './classes/CommandArgs';

/** Base class of the Commands */
export abstract class Command {
    public static NO_ARGUMENTS = 'Oops! I received no arguments. Please try again.';

    public static INSUFFICIENT_ARGUMENTS = 'Insufficient arguments. Please try again.';

    public static INTERNAL_ERROR_OCCURED = 'An internal error occured.';

    public static USERID_ERROR = 'Invalid User. Please try again.';

    public static MISSING_REASON = 'Missing a reason. Please try again';

    public static readonly EMBED_DEFAULT_COLOUR = 0x125bd1;

    public static readonly EMBED_ERROR_COLOUR = 0xff0000;

    public static ERROR_EMBED_TITLE = 'Error';

    public static NO_PERMISSIONS_MSG = 'You do not have the permissions to do that!';

    public NO_PERMISSIONS_COMMANDRESULT = new CommandResult(true);

    /**
     * This function executes the command.
     *
     * @param  {CommandArgs} commandArgs CommandArgs containing arguments that
     *                                   a command may use.
     * @returns CommandResult
     */
    public abstract execute(commandArgs: CommandArgs): Promise<CommandResult>;

    /**
     * This function checks if a given guildmember has the permissions required
     *
     * @param  {Permissions} commandPermissions Permissions of the command
     * @param  {Permissions} userPermissions Permissions of the user
     * @returns boolean
     */
    public hasPermissions(
        commandPermissions: Permissions,
        userPermissions: Readonly<Permissions>,
    ): boolean {
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
    protected async sendNoPermissionsMessage(messageReply: Function): Promise<void> {
        const embed = this.generateGenericEmbed(
            Command.ERROR_EMBED_TITLE,
            Command.NO_PERMISSIONS_MSG,
            Command.EMBED_ERROR_COLOUR,
        );
        await messageReply({ embeds: [embed] });
    }

    /**
     * This function generates a generic embed used by most of the command classes.
     *
     * @param  {string} title
     * @param  {string} message
     * @param  {string} colour
     * @returns MessageEmbed
     */
    protected generateGenericEmbed(title: string, message: string, colour: ColorResolvable): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(colour).addField(title, message);
        return embed;
    }
}

export type CommandClassRef<T = Command> = {
    NAME: string;
    DESCRIPTION: string;
    new(args: string[]): T;
};
