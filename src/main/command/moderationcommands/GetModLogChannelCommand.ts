import { PermissionsBitField, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModerationLog } from '../../modules/moderation/ModerationLog';

export class GetModLogChannelCommand extends Command {
    public static readonly NAME = 'GetModLogChannel';

    public static readonly DESCRIPTION = 'Displays the currently set ModLog channel';

    public static CHANNEL_NOT_SET = 'There is no ModLog channel set for this server.';

    public static EMBED_TITLE = 'ModLog Channel';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers]);

    /**
     * This function gets the modlog channel
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

        // Execute
        const channelId = ModerationLog.logChannel(server.serverId);

        // Check if channel is set
        if (channelId === null) {
            await messageReply({ embeds: [this.generateNotSetEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        await messageReply({ embeds: [this.generateValidEmbed(channelId)] });
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed for if channel is not set
     *
     * @returns RichEmbed
     */
    private generateNotSetEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            GetModLogChannelCommand.EMBED_TITLE,
            GetModLogChannelCommand.CHANNEL_NOT_SET,
            GetModLogChannelCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    /**
     * Generates embed if channel exists
     *
     * @param  {string} channelId
     * @returns RichEmbed
     */
    private generateValidEmbed(channelId: string): EmbedBuilder {
        return this.generateGenericEmbed(
            GetModLogChannelCommand.EMBED_TITLE,
            `ModLog Channel is currently set to <#${channelId}>.`,
            GetModLogChannelCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
