import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerSetResponseMessageCommand extends Command {
    public static EMBED_TITLE = 'Message Checker Response Message';

    public static MESSAGE_RESETTED = 'Response Message has been resetted because there was no arguments.';

    public static RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED = 'Reponse Message cannot be undefined!';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the setresponsemessage command
     * Sets the response message for the server.
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

        let embed: MessageEmbed;

        // Check if no args
        if (this.args.length === 0) {
            server.messageCheckerSettings.setResponseMessage(
                server.serverId,
                null,
            );
            embed = this.generateResetEmbed();
            await messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        let msg = '';
        for (let i = 0; i < this.args.length; i++) {
            msg += this.args[i];
            msg += (i !== this.args.length - 1) ? ' ' : '';
        }
        server.messageCheckerSettings.setResponseMessage(
            server.serverId,
            msg,
        );
        embed = this.generateValidEmbed(msg);
        await messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates reset embed
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateResetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            MsgCheckerSetResponseMessageCommand.EMBED_TITLE,
            MsgCheckerSetResponseMessageCommand.MESSAGE_RESETTED,
            MsgCheckerSetResponseMessageCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    /**
     * Generates valid embed
     *
     * @param  {string} msg
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(msg: string): MessageEmbed {
        return this.generateGenericEmbed(
            MsgCheckerSetResponseMessageCommand.EMBED_TITLE,
            `Response Message set to ${msg}`,
            MsgCheckerSetResponseMessageCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
