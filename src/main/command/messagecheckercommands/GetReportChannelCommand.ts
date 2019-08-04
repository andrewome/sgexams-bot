import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class GetReportChannelCommand extends Command {
    public static COMMAND_NAME = 'GetReportChannel';

    public static COMMAND_NAME_LOWER_CASE = GetReportChannelCommand.COMMAND_NAME.toLowerCase();

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

        // Execute
        messageReply(this.generateEmbed(server));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed that is sent back to user
     *
     * @param  {Server} server
     * @returns RichEmbed
     */
    /* eslint-disable class-methods-use-this */
    public generateEmbed(server: Server): RichEmbed {
        const channelId = server.messageCheckerSettings.getReportingChannelId();
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (typeof channelId === 'undefined') {
            embed.addField(GetReportChannelCommand.EMBED_TITLE,
                GetReportChannelCommand.CHANNEL_NOT_SET);
        } else {
            const msg = `Reporting Channel is currently set to <#${channelId}>.`;
            embed.addField(GetReportChannelCommand.EMBED_TITLE, msg);
        }
        return embed;
    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    public changeServerSettings(server: Server, ...args: any): void {
        throw new Error(Command.THIS_METHOD_SHOULD_NOT_BE_CALLED);
    }
    /* eslint-enable class-methods-use-this */
}
