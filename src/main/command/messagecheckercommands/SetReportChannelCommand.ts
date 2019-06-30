import { Permissions, Message, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export enum ResponseType {
    RESET = 0,
    UNDEFINED = 1,
    NOT_TEXT_CHANNEL = 2,
    VALID = 3
}

export class SetReportChannelCommand extends Command {
    public static COMMAND_NAME = 'setreportchannel';

    public static DESCRIPTION = 'Sets the reporting channel to post incident reports for this server when blacklisted words are used.';

    public static CHANNEL_NOT_FOUND = 'Channel was not found. Please submit a valid channel ID.';

    public static NOT_TEXT_CHANNEL = 'Channel is not a Text Channel. Make sure the Channel you are submitting is a Text Channel';

    public static EMBED_TITLE = 'Reporting Channel';

    public static CHANNEL_RESETTED = 'Reporting Channel has been resetted because there were no arguments. Please set a new one.';

    public static CHANNELID_CANNOT_BE_UNDEFINED = 'Channel ID cannot be undefined!';

    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);

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
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns CommandResult
     */
    public execute(server: Server, message: Message): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, message.member.permissions)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        let embed: RichEmbed;
        if (this.args.length === 0) {
            embed = this.generateEmbed(ResponseType.RESET);
            this.changeServerSettings(server, undefined);
        } else {
            const channelId = this.args[0];

            // Check if valid channel
            const channel = message.guild.channels.get(channelId);
            if (typeof channel === 'undefined') {
                embed = this.generateEmbed(ResponseType.UNDEFINED);
            } else if (channel.type !== 'text') {
                embed = this.generateEmbed(ResponseType.NOT_TEXT_CHANNEL);
            } else {
                embed = this.generateEmbed(ResponseType.VALID, channelId);
                this.changeServerSettings(server, channelId);
            }
        }
        message.channel.send(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed that is sent back to user
     *
     * @param  {ResponseType} type RESET/UNDEFINED/NOT_TEXT_CHANNEL/VALID
     * @param  {string} channelId?
     * @returns RichEmbed
     */
    /* eslint-disable class-methods-use-this */
    public generateEmbed(type: ResponseType, channelId?: string): RichEmbed {
        const embed = new RichEmbed();
        if (type === ResponseType.RESET) {
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(SetReportChannelCommand.EMBED_TITLE,
                SetReportChannelCommand.CHANNEL_RESETTED);
        }
        if (type === ResponseType.UNDEFINED) {
            embed.setColor(Command.EMBED_ERROR_COLOUR);
            embed.addField(SetReportChannelCommand.EMBED_TITLE,
                SetReportChannelCommand.CHANNEL_NOT_FOUND);
        }
        if (type === ResponseType.NOT_TEXT_CHANNEL) {
            embed.setColor(Command.EMBED_ERROR_COLOUR);
            embed.addField(SetReportChannelCommand.EMBED_TITLE,
                SetReportChannelCommand.NOT_TEXT_CHANNEL);
        }
        if (type === ResponseType.VALID) {
            if (channelId === undefined) {
                throw new Error(SetReportChannelCommand.CHANNELID_CANNOT_BE_UNDEFINED);
            }
            const msg = `Reporting Channel set to <#${channelId}>.`;
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(SetReportChannelCommand.EMBED_TITLE, msg);
        }
        return embed;
    }

    /**
     * Sets the reporting channel of the server
     *
     * @param  {Server} server
     * @param  {string|undefined} channelId channel id.
     * @returns void
     */
    public changeServerSettings(server: Server, channelId: string|undefined): void {
        if (channelId !== undefined) {
            server.messageCheckerSettings.setReportingChannelId(channelId);
        } else {
            server.messageCheckerSettings.setReportingChannelId(undefined);
        }
    }
    /* eslint-enable class-methods-use-this */
}
