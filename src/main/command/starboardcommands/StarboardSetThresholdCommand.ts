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
    public execute(commandArgs: CommandArgs): CommandResult {
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
    // eslint-disable-next-line class-methods-use-this
    private generateResetEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(StarboardSetThresholdCommand.EMBED_TITLE,
                       StarboardSetThresholdCommand.THRESHOLD_RESETTED);
        return embed;
    }

    /**
     * Generates embed if invalid
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateInvalidEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(StarboardSetThresholdCommand.EMBED_TITLE,
                       StarboardSetThresholdCommand.NOT_AN_INTEGER);
        return embed;
    }

    /**
     * Generates embed if valid
     *
     * @param  {number} threshold
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(threshold: number): MessageEmbed {
        const embed = new MessageEmbed();
        const msg = `Starboard threshold set to ${threshold}.`;
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(StarboardSetThresholdCommand.EMBED_TITLE, msg);
        return embed;
    }
}
