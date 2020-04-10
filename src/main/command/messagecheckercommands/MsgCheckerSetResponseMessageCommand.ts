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
    public execute(commandArgs: CommandArgs): CommandResult {
        const { server, memberPerms, messageReply } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
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
            messageReply(embed);
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
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates reset embed
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateResetEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(MsgCheckerSetResponseMessageCommand.EMBED_TITLE,
                       MsgCheckerSetResponseMessageCommand.MESSAGE_RESETTED);

        return embed;
    }

    /**
     * Generates valid embed
     *
     * @param  {string} msg
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(msg: string): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        const responseMessage = `Response Message set to ${msg}`;
        embed.addField(MsgCheckerSetResponseMessageCommand.EMBED_TITLE, responseMessage);

        return embed;
    }
}
