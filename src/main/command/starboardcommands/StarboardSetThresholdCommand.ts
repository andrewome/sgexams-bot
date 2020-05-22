import { MessageEmbed, Permissions } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardSetThresholdCommand extends Command {
    public static NOT_AN_INTEGER = 'Threshold not a positive integer.';

    public static EMBED_TITLE = 'Starboard Threshold';

    public static THRESHOLD_RESETTED = 'Starboard Threshold has been resetted because there were no arguments. Please set a new one.';

    public static THRESHOLD_CANNOT_BE_UNDEFINED = 'Channel ID cannot be undefined!';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private COMMAND_UNSUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

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
        let embed: MessageEmbed;
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            server.starboardSettings.setThreshold(server.serverId, null);
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
        server.starboardSettings.setThreshold(server.serverId, thresholdVal);
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed if resetting
     *
     * @returns RichEmbed
     */
    private generateResetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            StarboardSetThresholdCommand.EMBED_TITLE,
            StarboardSetThresholdCommand.THRESHOLD_RESETTED,
            StarboardSetThresholdCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    /**
     * Generates embed if invalid
     *
     * @returns RichEmbed
     */
    private generateInvalidEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            StarboardSetThresholdCommand.EMBED_TITLE,
            StarboardSetThresholdCommand.NOT_AN_INTEGER,
            StarboardSetThresholdCommand.EMBED_ERROR_COLOUR,
        );
    }

    /**
     * Generates embed if valid
     *
     * @param  {number} threshold
     * @returns RichEmbed
     */
    private generateValidEmbed(threshold: number): MessageEmbed {
        return this.generateGenericEmbed(
            StarboardSetThresholdCommand.EMBED_TITLE,
            `Starboard threshold set to ${threshold}.`,
            StarboardSetThresholdCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
