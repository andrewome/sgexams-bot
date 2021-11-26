import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardGetChannelCommand extends Command {
    public static CHANNEL_NOT_SET = 'There is no Starboard channel set for this server.';

    public static EMBED_TITLE = 'Starboard Channel';

    public static readonly NAME = 'StarboardGetChannel';

    public static readonly DESCRIPTION = 'Displays the currently set Starboard channel';

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
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        const channelId = server.starboardSettings.getChannel();

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
    private generateNotSetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            StarboardGetChannelCommand.EMBED_TITLE,
            StarboardGetChannelCommand.CHANNEL_NOT_SET,
            StarboardGetChannelCommand.EMBED_DEFAULT_COLOUR,
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
            StarboardGetChannelCommand.EMBED_TITLE,
            `Starboard Channel is currently set to <#${channelId}>.`,
            StarboardGetChannelCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
