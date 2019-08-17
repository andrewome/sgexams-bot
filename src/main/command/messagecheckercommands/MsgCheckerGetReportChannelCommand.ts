import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class MsgCheckerGetReportChannelCommand extends Command {
    public static COMMAND_NAME = 'GetReportChannel';

    public static COMMAND_NAME_LOWER_CASE
        = MsgCheckerGetReportChannelCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Displays the reporting channel to post incident reports for this server when blacklisted words are used.';

    public static CHANNEL_NOT_SET = 'There is no reporting channel set for this server.';

    public static EMBED_TITLE = 'Reporting Channel';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the getchannel command
     * Sets the reporting channel of the server.
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

        // Generate embed
        const channelId = server.messageCheckerSettings.getReportingChannelId();
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (typeof channelId === 'undefined') {
            embed.addField(MsgCheckerGetReportChannelCommand.EMBED_TITLE,
                MsgCheckerGetReportChannelCommand.CHANNEL_NOT_SET);
        } else {
            const msg = `Reporting Channel is currently set to <#${channelId}>.`;
            embed.addField(MsgCheckerGetReportChannelCommand.EMBED_TITLE, msg);
        }

        // Execute
        messageReply(embed);

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
