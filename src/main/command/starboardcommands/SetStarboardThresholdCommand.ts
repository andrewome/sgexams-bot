import { RichEmbed, Permissions } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export enum ResponseType {
    RESET = 0,
    NOT_VALID = 1,
    VALID = 2
}

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
            embed = this.generateEmbed(ResponseType.RESET);
            this.changeServerSettings(server, null);
        } else {
            const threshold = this.args[0];

            // Check if valid number
            const thresholdVal = parseInt(threshold, 10);
            if (Number.isNaN(thresholdVal) || thresholdVal < 1) {
                embed = this.generateEmbed(ResponseType.NOT_VALID);
            } else {
                embed = this.generateEmbed(ResponseType.VALID, thresholdVal);
                this.changeServerSettings(server, thresholdVal);
            }
        }
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed that is sent back to user
     *
     * @param  {ResponseType} type RESET/UNDEFINED/VALID
     * @param  {string} channelId?
     * @returns RichEmbed
     */
    /* eslint-disable class-methods-use-this */
    public generateEmbed(type: ResponseType, threshold?: number): RichEmbed {
        const embed = new RichEmbed();
        if (type === ResponseType.RESET) {
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(SetStarboardThresholdCommand.EMBED_TITLE,
                SetStarboardThresholdCommand.THRESHOLD_RESETTED);
        }
        if (type === ResponseType.NOT_VALID) {
            embed.setColor(Command.EMBED_ERROR_COLOUR);
            embed.addField(SetStarboardThresholdCommand.EMBED_TITLE,
                SetStarboardThresholdCommand.NOT_AN_INTEGER);
        }
        if (type === ResponseType.VALID) {
            if (threshold === undefined) {
                throw new Error(SetStarboardThresholdCommand.THRESHOLD_CANNOT_BE_UNDEFINED);
            }
            const msg = `Starboard threshold set to ${threshold}.`;
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(SetStarboardThresholdCommand.EMBED_TITLE, msg);
        }
        return embed;
    }

    /**
     * Sets the starboard channel of the server
     *
     * @param  {Server} server
     * @param  {number|undefined} threshold threshold
     * @returns void
     */
    public changeServerSettings(server: Server, threshold: number | null): void {
        server.starboardSettings.setThreshold(threshold);
    }
    /* eslint-enable class-methods-use-this */
}
