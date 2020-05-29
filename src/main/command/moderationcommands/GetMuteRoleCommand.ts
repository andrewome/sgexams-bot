import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class GetMuteRoleCommand extends Command {
    public static ROLE_NOT_SET = 'There is no Mute Role set for this server.';

    public static EMBED_TITLE = 'Mute Role';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function outputs the mute role for the server.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { server, memberPerms, messageReply } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        const roleId = ModDbUtils.getMuteRoleId(server.serverId);

        // Check if channel is set
        if (roleId === null) {
            messageReply(this.generateNotSetEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        messageReply(this.generateValidEmbed(roleId));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed for if role is not set
     *
     * @returns RichEmbed
     */
    private generateNotSetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            GetMuteRoleCommand.EMBED_TITLE,
            GetMuteRoleCommand.ROLE_NOT_SET,
            GetMuteRoleCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    /**
     * Generates embed if role exists in DB
     *
     * @param  {string} roleId
     * @returns RichEmbed
     */
    private generateValidEmbed(roleId: string): MessageEmbed {
        return this.generateGenericEmbed(
            GetMuteRoleCommand.EMBED_TITLE,
            `ModLog Channel is currently set to <@&${roleId}>.`,
            GetMuteRoleCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
