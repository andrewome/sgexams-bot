import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerGetReportChannelCommand extends Command {
    public static CHANNEL_NOT_SET = 'There is no reporting channel set for this server.';

    public static EMBED_TITLE = 'Reporting Channel';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the getchannel command
     * Sets the reporting channel of the server.
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

        // Generate embed
        const channelId = server.messageCheckerSettings.getReportingChannelId();
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (channelId === null) {
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
