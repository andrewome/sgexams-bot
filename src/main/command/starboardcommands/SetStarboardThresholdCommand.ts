import { RichEmbed, Permissions } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class SetStarboardThresholdCommand extends Command {
    public static COMMAND_NAME = 'SetStarboardThreshold';

    public static COMMAND_NAME_LOWER_CASE
        = SetStarboardThresholdCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Sets the emoji threshold for a message to be starred.'

    public static NOT_AN_INTEGER = 'Threshold not a positive integer.';

    public static EMBED_TITLE = 'Starboard Threshold';

    public static THRESHOLD_RESETTED = 'Starboard Threshold has been resetted because there were no arguments. Please set a new one.';

    public static THRESHOLD_CANNOT_BE_UNDEFINED = 'Channel ID cannot be undefined!';

    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);

    private COMMAND_UNSUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the setstarboardchannel command
     * Sets the starboard channel of the server.
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

        // Execute
        let embed: RichEmbed;
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            server.starboardSettings.setThreshold(null);
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const threshold = this.args[0];

        // Check if invalid number
        const thresholdVal = parseInt(threshold, 10);
        if (Number.isNaN(thresholdVal) || thresholdVal < 1) {
            embed = this.generateInvalidEmbed();
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        embed = this.generateValidEmbed(thresholdVal);
        server.starboardSettings.setThreshold(thresholdVal);
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed if resetting
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateResetEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(SetStarboardThresholdCommand.EMBED_TITLE,
            SetStarboardThresholdCommand.THRESHOLD_RESETTED);
        return embed;
    }

    /**
     * Generates embed if invalid
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateInvalidEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(SetStarboardThresholdCommand.EMBED_TITLE,
            SetStarboardThresholdCommand.NOT_AN_INTEGER);
        return embed;
    }

    /**
     * Generates embed if valid
     *
     * @param  {number} threshold
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(threshold: number): RichEmbed {
        const embed = new RichEmbed();
        const msg = `Starboard threshold set to ${threshold}.`;
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(SetStarboardThresholdCommand.EMBED_TITLE, msg);
        return embed;
    }
}
