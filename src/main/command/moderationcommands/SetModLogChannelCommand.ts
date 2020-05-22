import {
    Permissions, MessageEmbed, Channel,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class SetModLogChannelCommand extends Command {
    public static NOT_TEXT_CHANNEL = 'Channel is not a Text Channel. Make sure the Channel you are submitting is a Text Channel';

    public static CHANNEL_NOT_FOUND = 'Channel was not found. Please submit a valid channel ID.';

    public static EMBED_TITLE = 'ModLog Channel';

    public static CHANNEL_RESETTED = 'ModLog Channel has been resetted because there were no arguments. Please set a new one.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private args: string[];

    private permissions = new Permissions(['BAN_MEMBERS']);

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function sets reporting channel for the server.
     * All mod actions done will be sent here.
     *
     * @param  {CommandArgs} commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            server, memberPerms, messageReply, channels,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        let embed: MessageEmbed;
        // Check number of args, 0 args means reset.
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            messageReply(embed);
            ModDbUtils.setModLogChannel(server.serverId, null);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const channelId = this.args[0];
        const channel = channels!.resolve(channelId);

        // Check if valid channel
        if (channel === null) {
            embed = this.generateNotFoundEmbed();
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // If not text channel
        if ((channel as Channel).type !== 'text') {
            embed = this.generateNotTextChannelEmbed();
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Valid channelId
        ModDbUtils.setModLogChannel(server.serverId, channelId);
        embed = this.generateValidEmbed(channelId);
        messageReply(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed for reset
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateResetEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(SetModLogChannelCommand.EMBED_TITLE,
                       SetModLogChannelCommand.CHANNEL_RESETTED);

        return embed;
    }

    /**
     * Generate embed if channel is not found
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotFoundEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(SetModLogChannelCommand.EMBED_TITLE,
                       SetModLogChannelCommand.CHANNEL_NOT_FOUND);

        return embed;
    }

    /**
     * Generates embed if not text channel
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotTextChannelEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(SetModLogChannelCommand.EMBED_TITLE,
                       SetModLogChannelCommand.NOT_TEXT_CHANNEL);

        return embed;
    }

    /**
     * Generate embed for valid channel
     *
     * @param  {string} channelId
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(channelId: string): MessageEmbed {
        const embed = new MessageEmbed();
        const msg = `Starboard Channel set to <#${channelId}>.`;
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(SetModLogChannelCommand.EMBED_TITLE, msg);

        return embed;
    }

}
