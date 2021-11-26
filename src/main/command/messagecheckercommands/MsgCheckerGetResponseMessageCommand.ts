import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerGetResponseMessageCommand extends Command {
    public static CHANNEL_NOT_SET = 'There is no message set for this server.';

    public static EMBED_TITLE = 'Message Checker Response Message';

    public static readonly NAME = 'MsgCheckerGetResponseMsg';

    public static readonly DESCRIPTION =
        'Displays the response message to the user upon detection of blacklisted words for this server.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the setchannel command
     * Sets the reporting channel of the server.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { server, memberPerms, messageReply } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Generate embed and send
        const responseMessage = server.messageCheckerSettings.getResponseMessage();
        let embed: MessageEmbed;
        if (responseMessage === null) {
            embed = this.generateGenericEmbed(
                MsgCheckerGetResponseMessageCommand.EMBED_TITLE,
                MsgCheckerGetResponseMessageCommand.CHANNEL_NOT_SET,
                MsgCheckerGetResponseMessageCommand.EMBED_DEFAULT_COLOUR,
            );
        } else {
            const msg = `Response message is ${responseMessage}.`;
            embed = this.generateGenericEmbed(
                MsgCheckerGetResponseMessageCommand.EMBED_TITLE,
                msg,
                MsgCheckerGetResponseMessageCommand.EMBED_DEFAULT_COLOUR,
            );
        }
        await messageReply({ embeds: [embed] });
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
