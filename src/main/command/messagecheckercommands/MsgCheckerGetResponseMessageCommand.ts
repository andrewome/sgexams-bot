import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class MsgCheckerGetResponseMessageCommand extends Command {
    public static CHANNEL_NOT_SET = 'There is no message set for this server.';

    public static EMBED_TITLE = 'Response Message'

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

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
                   messageReply: Function): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Get embed
        const responseMessage = server.messageCheckerSettings.getResponseMessage();
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (typeof responseMessage === 'undefined') {
            embed.addField(MsgCheckerGetResponseMessageCommand.EMBED_TITLE,
                MsgCheckerGetResponseMessageCommand.CHANNEL_NOT_SET);
        } else {
            const msg = `Response message is ${responseMessage}.`;
            embed.addField(MsgCheckerGetResponseMessageCommand.EMBED_TITLE, msg);
        }

        // Execute
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
