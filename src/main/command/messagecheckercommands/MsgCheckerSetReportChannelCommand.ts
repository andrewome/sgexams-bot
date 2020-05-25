import {
    Permissions, MessageEmbed, Channel,
} from 'discord.js';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { Command } from '../Command';

export class MsgCheckerSetReportChannelCommand extends Command {
    public static CHANNEL_NOT_FOUND = 'Channel was not found. Please submit a valid channel ID.';

    public static NOT_TEXT_CHANNEL = 'Channel is not a Text Channel. Make sure the Channel you are submitting is a Text Channel';

    public static EMBED_TITLE = 'Message Checker Reporting Channel';

    public static CHANNEL_RESETTED = 'Reporting Channel has been resetted because there were no arguments. Please set a new one.';

    public static CHANNELID_CANNOT_BE_UNDEFINED = 'Channel ID cannot be undefined!';

    /** CheckMessage: true */
    private COMMAND_DEFAULT_COMMANDRESULT: CommandResult = new CommandResult(true);

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
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            server, memberPerms, messageReply, channels,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        let embed: MessageEmbed;
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            server.messageCheckerSettings.setReportingChannelId(
                server.serverId,
                null,
            );
            messageReply(embed);
            return this.COMMAND_DEFAULT_COMMANDRESULT;
        }

        const channelId = this.args[0];

        // Check if valid channel
        const channel = channels!.resolve(channelId);
        if (channel === null) {
            embed = this.generateInvalidEmbed();
            messageReply(embed);
            return this.COMMAND_DEFAULT_COMMANDRESULT;
        }

        // If not text
        if ((channel as Channel).type !== 'text') {
            embed = this.generateNotTextChannelEmbed();
            messageReply(embed);
            return this.COMMAND_DEFAULT_COMMANDRESULT;
        }

        embed = this.generateValidEmbed(channelId);
        server.messageCheckerSettings.setReportingChannelId(
            server.serverId,
            channelId,
        );
        messageReply(embed);
        return this.COMMAND_DEFAULT_COMMANDRESULT;
    }


    /**
     * Generates reset response
     *
     * @returns RichEmbed
     */
    private generateResetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            MsgCheckerSetReportChannelCommand.EMBED_TITLE,
            MsgCheckerSetReportChannelCommand.CHANNEL_RESETTED,
            MsgCheckerSetReportChannelCommand.EMBED_DEFAULT_COLOUR,
        );
    }


    /**
     * Generates invalid response
     *
     * @returns RichEmbed
     */
    private generateInvalidEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            MsgCheckerSetReportChannelCommand.EMBED_TITLE,
            MsgCheckerSetReportChannelCommand.CHANNEL_NOT_FOUND,
            MsgCheckerSetReportChannelCommand.EMBED_ERROR_COLOUR,
        );
    }


    /**
     * Generates not text channel response
     *
     * @returns RichEmbed
     */
    private generateNotTextChannelEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            MsgCheckerSetReportChannelCommand.EMBED_TITLE,
            MsgCheckerSetReportChannelCommand.NOT_TEXT_CHANNEL,
            MsgCheckerSetReportChannelCommand.EMBED_ERROR_COLOUR,
        );
    }

    /**
     * Generates valid response
     *
     * @param  {string} channelId
     * @returns RichEmbed
     */
    private generateValidEmbed(channelId: string): MessageEmbed {
        return this.generateGenericEmbed(
            MsgCheckerSetReportChannelCommand.EMBED_TITLE,
            `Reporting Channel set to <#${channelId}>.`,
            MsgCheckerSetReportChannelCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
