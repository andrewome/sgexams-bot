import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export class MsgCheckerSetResponseMessageCommand extends Command {
    public static COMMAND_NAME = 'SetResponseMessage';

    public static COMMAND_NAME_LOWER_CASE =
        MsgCheckerSetResponseMessageCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Sets the response message to the user upon detection of blacklisted words for this server.';

    public static EMBED_TITLE = 'Reponse Message';

    public static MESSAGE_RESETTED = 'Response Message has been resetted because there was no arguments.';

    public static RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED = 'Reponse Message cannot be undefined!';

    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);

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

        let embed: RichEmbed;

        // Check if no args
        if (this.args.length === 0) {
            server.messageCheckerSettings.setResponseMessage(undefined);
            embed = this.generateResetEmbed();
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        let msg = '';
        for (let i = 0; i < this.args.length; i++) {
            msg += this.args[i];
            msg += (i !== this.args.length - 1) ? ' ' : '';
        }
        server.messageCheckerSettings.setResponseMessage(msg);
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
    private generateResetEmbed(): RichEmbed {
        const embed = new RichEmbed();
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
    private generateValidEmbed(msg: string): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        const responseMessage = `Response Message set to ${msg}`;
        embed.addField(MsgCheckerSetResponseMessageCommand.EMBED_TITLE, responseMessage);

        return embed;
    }
}
