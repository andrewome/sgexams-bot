import {
 Permissions, RichEmbed, Channel, Collection, Emoji,
} from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { RotateImageCommandData } from '../rotateimagecommands/RotateImageCommandData';

export class MsgCheckerSetReportChannelCommand extends Command {
    public static COMMAND_NAME = 'SetReportChannel';

    public static COMMAND_NAME_LOWER_CASE =
        MsgCheckerSetReportChannelCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Sets the reporting channel to post incident reports for this server when blacklisted words are used.';

    public static CHANNEL_NOT_FOUND = 'Channel was not found. Please submit a valid channel ID.';

    public static NOT_TEXT_CHANNEL = 'Channel is not a Text Channel. Make sure the Channel you are submitting is a Text Channel';

    public static EMBED_TITLE = 'Reporting Channel';

    public static CHANNEL_RESETTED = 'Reporting Channel has been resetted because there were no arguments. Please set a new one.';

    public static CHANNELID_CANNOT_BE_UNDEFINED = 'Channel ID cannot be undefined!';

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
     * This function executes the setchannel command
     * Sets the reporting channel of the server.
     *
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns CommandResult
     */
    public execute(server: Server,
                   memberPerms: Permissions,
                   messageReply: Function,
                   ...args:
                    (Collection<string, Channel> |
                     Collection<string, Emoji> |
                     RotateImageCommandData)[]): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        let embed: RichEmbed;
        const channels = args[0];
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            server.messageCheckerSettings.setReportingChannelId(undefined);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const channelId = this.args[0];

        // Check if valid channel
        const channel = (channels as Collection<string, Channel>).get(channelId);
        if (typeof channel === 'undefined') {
            embed = this.generateInvalidEmbed();
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        // If not text
        if ((channel as Channel).type !== 'text') {
            embed = this.generateNotTextChannelEmbed();
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        embed = this.generateValidEmbed(channelId);
        server.messageCheckerSettings.setReportingChannelId(channelId);
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }


    /**
     * Generates reset response
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateResetEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(MsgCheckerSetReportChannelCommand.EMBED_TITLE,
        MsgCheckerSetReportChannelCommand.CHANNEL_RESETTED);

        return embed;
    }


    /**
     * Generates invalid response
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateInvalidEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(MsgCheckerSetReportChannelCommand.EMBED_TITLE,
            MsgCheckerSetReportChannelCommand.CHANNEL_NOT_FOUND);

        return embed;
    }


    /**
     * Generates not text channel response
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotTextChannelEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(MsgCheckerSetReportChannelCommand.EMBED_TITLE,
            MsgCheckerSetReportChannelCommand.NOT_TEXT_CHANNEL);

        return embed;
    }

    /**
     * Generates valid response
     *
     * @param  {string} channelId
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(channelId: string): RichEmbed {
        const embed = new RichEmbed();
        const msg = `Reporting Channel set to <#${channelId}>.`;
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(MsgCheckerSetReportChannelCommand.EMBED_TITLE, msg);

        return embed;
    }
}
