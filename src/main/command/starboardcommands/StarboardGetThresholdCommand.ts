import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class StarboardGetThresholdCommand extends Command {
    public static COMMAND_NAME = 'GetStarboardThreshold';

    public static COMMAND_NAME_LOWER_CASE = StarboardGetThresholdCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Displays the emoji threshold for a message to be starred.';

    public static THRESHOLD_NOT_SET = 'Threshold has not been set!';

    public static EMBED_TITLE = 'Starboard Threshold';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the getchannel command
     * Sets the Starboard channel of the server.
     *
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns CommandResult
     */
    public execute(server: Server,
                   memberPerms: Permissions,
                   messageReply: Function): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        const threshold = server.starboardSettings.getThreshold();
        // Check if threshold is set
        if (threshold === null) {
            messageReply(this.generateNotSetEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        messageReply(this.generateValidEmbed(threshold));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed if theshold is not set
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotSetEmbed(): RichEmbed {
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(StarboardGetThresholdCommand.EMBED_TITLE,
            StarboardGetThresholdCommand.THRESHOLD_NOT_SET);

        return embed;
    }

    /**
     * Generates embed if threshold is set
     *
     * @param  {number} threshold
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(threshold: number): RichEmbed {
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        const msg = `The emoji threshold is currently ${threshold}.`;
        embed.addField(StarboardGetThresholdCommand.EMBED_TITLE, msg);

        return embed;
    }
}
