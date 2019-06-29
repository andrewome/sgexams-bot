import { Permissions, Message, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export enum ResponseType {
    RESET = 0,
    VALID = 1
}

export class SetResponseMessageCommand extends Command {
    static COMMAND_NAME = 'setresponsemessage';

    static DESCRIPTION = 'Sets the response message to the user upon detection of blacklisted words for this server.';

    static EMBED_TITLE = 'Reponse Message';

    static MESSAGE_RESETTED = 'Response Message has been resetted because there was no arguments.';

    static RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED = 'Reponse Message cannot be undefined!';

    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private args: string[];

    constructor(args: string[]) {
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
    public execute(server: Server, message: Message): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, message.member.permissions)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        let embed: RichEmbed;
        if (this.args.length === 0) {
            this.changeServerSettings(server, undefined);
            embed = this.generateEmbed(ResponseType.RESET);
        } else {
            let msg = '';
            for (let i = 0; i < this.args.length; i++) {
                msg += this.args[i];
                msg += (i !== this.args.length - 1) ? ' ' : '';
            }
            this.changeServerSettings(server, msg);
            embed = this.generateEmbed(ResponseType.VALID, msg);
        }

        message.channel.send(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed that is sent back to user
     *
     * @param  {ResponseType} type VALID/RESET
     * @param  {string} msg? Response Message
     * @returns RichEmbed
     */
    public generateEmbed(type: ResponseType, msg?: string): RichEmbed {
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (type === ResponseType.RESET) {
            embed.addField(SetResponseMessageCommand.EMBED_TITLE,
                SetResponseMessageCommand.MESSAGE_RESETTED);
        }
        if (type === ResponseType.VALID) {
            if (msg === undefined) {
                throw new Error(SetResponseMessageCommand.RESPONSE_MESSAGE_CANNOT_BE_UNDEFINED);
            }
            const responseMessage = `Response Message set to ${msg}`;
            embed.addField(SetResponseMessageCommand.EMBED_TITLE, responseMessage);
        }
        return embed;
    }

    /**
     * Sets the response message of the server
     *
     * @param  {Server} server
     * @param  {string|undefined} responseMessage
     * @returns void
     */
    public changeServerSettings(server: Server, responseMessage: string|undefined): void {
        if (responseMessage === undefined) {
            server.messageCheckerSettings.setResponseMessage(undefined);
        } else {
            server.messageCheckerSettings.setResponseMessage(responseMessage);
        }
    }
}
