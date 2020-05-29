import {
    Permissions, MessageEmbed,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class SetMuteRoleCommand extends Command {
    public static ROLE_NOT_FOUND = 'Role was not found. Please submit a valid role ID.';

    public static EMBED_TITLE = 'Mute Role';

    public static ROLE_RESETTED = 'Mute Role has been resetted because there were no arguments. Please set a new one.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private args: string[];

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function sets mute role for the server.
     *
     * @param  {CommandArgs} commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            server, memberPerms, messageReply, roles,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        let embed: MessageEmbed;
        // Check number of args, 0 args means reset.
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            messageReply(embed);
            ModDbUtils.setMuteRoleId(server.serverId, null);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const roleId = this.args[0];
        const channel = roles!.resolve(roleId);

        // Check if valid role
        if (channel === null) {
            embed = this.generateNotFoundEmbed();
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Valid roleId
        ModDbUtils.setMuteRoleId(server.serverId, roleId);
        embed = this.generateValidEmbed(roleId);
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed for reset
     *
     * @returns RichEmbed
     */
    private generateResetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            SetMuteRoleCommand.EMBED_TITLE,
            SetMuteRoleCommand.ROLE_RESETTED,
            SetMuteRoleCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    /**
     * Generate embed if role is not found
     *
     * @returns RichEmbed
     */
    private generateNotFoundEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            SetMuteRoleCommand.EMBED_TITLE,
            SetMuteRoleCommand.ROLE_NOT_FOUND,
            SetMuteRoleCommand.EMBED_ERROR_COLOUR,
        );
    }

    /**
     * Generate embed for valid channel
     *
     * @param  {string} channelId
     * @returns RichEmbed
     */
    private generateValidEmbed(roleId: string): MessageEmbed {
        return this.generateGenericEmbed(
            SetMuteRoleCommand.EMBED_TITLE,
            `Mute Role set to <@&${roleId}>.`,
            SetMuteRoleCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
