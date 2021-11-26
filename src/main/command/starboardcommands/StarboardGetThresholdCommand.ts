import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardGetThresholdCommand extends Command {
    public static readonly NAME = 'StarboardGetThreshold';

    public static readonly DESCRIPTION =
        'Displays the emoji threshold for a message to be starred.';

    public static THRESHOLD_NOT_SET = 'Threshold has not been set!';

    public static EMBED_TITLE = 'Starboard Threshold';

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

        const threshold = server.starboardSettings.getThreshold();
        // Check if threshold is set
        if (threshold === null) {
            await messageReply({ embeds: [this.generateNotSetEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        await messageReply({ embeds: [this.generateValidEmbed(threshold)] });
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed if theshold is not set
     *
     * @returns RichEmbed
     */
    private generateNotSetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            StarboardGetThresholdCommand.EMBED_TITLE,
            StarboardGetThresholdCommand.THRESHOLD_NOT_SET,
            StarboardGetThresholdCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    /**
     * Generates embed if threshold is set
     *
     * @param  {number} threshold
     * @returns RichEmbed
     */
    private generateValidEmbed(threshold: number): MessageEmbed {
        return this.generateGenericEmbed(
            StarboardGetThresholdCommand.EMBED_TITLE,
            `The emoji threshold is currently ${threshold}.`,
            StarboardGetThresholdCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
