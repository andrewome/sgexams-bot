import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class GetModLogChannelCommand extends Command {
    public static CHANNEL_NOT_SET = 'There is no ModLog channel set for this server.';

    public static EMBED_TITLE = 'ModLog Channel';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the getchannel command
     * Sets the Starboard channel of the server.
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
        const channelId = ModDbUtils.getModLogChannel(server.serverId);

        // Check if channel is set
        if (channelId === null) {
            messageReply(this.generateNotSetEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        messageReply(this.generateValidEmbed(channelId));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed for if channel is not set
     *
     * @returns RichEmbed
     */
    private generateNotSetEmbed(): MessageEmbed {
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
    private generateValidEmbed(channelId: string): MessageEmbed {
        return this.generateGenericEmbed(
            GetModLogChannelCommand.EMBED_TITLE,
            `ModLog Channel is currently set to <#${channelId}>.`,
            GetModLogChannelCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
