import { Permissions, MessageEmbed, Channel } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { setBirthdayChannel } from '../../modules/birthday/BirthdayDbUtil';
import { isChannelTag } from '../../modules/birthday/BirthdayUtil';

const NOT_TEXT_CHANNEL =
    'Channel is not a Text Channel. Make sure the Channel you are submitting is a Text Channel';

const CHANNEL_NOT_FOUND =
    'Channel was not found. Please submit a valid channel ID.';

const EMBED_TITLE = 'Birthday Channel';

const CHANNEL_RESETTED =
    'Birthday Channel has been reset because there were no arguments. Please set a new one.';

const SUCCESSFUL_COMMANDRESULT = new CommandResult(true);

export class SetBirthdayChannelCommand extends Command {
    public static readonly NAME = 'SetBirthdayChannel';

    public static readonly DESCRIPTION
        = 'Assigns the given channel as the birthday announcements channel.';

    private args: string[];

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function sets birthday announcements channel for the server.
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
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        let embed: MessageEmbed;
        // Check number of args, 0 args means reset.
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            await messageReply(embed);
            setBirthdayChannel(server.serverId, null);
            return SUCCESSFUL_COMMANDRESULT;
        }

        let channelId = this.args[0];
        // Check if `channelId` is a channel tag (e.g. #general)
        if (isChannelTag(channelId)) {
            channelId = channelId.substr(2, channelId.length - 3);
        }
        const channel = channels!.resolve(channelId);

        // Check if valid channel
        if (channel === null) {
            embed = this.generateNotFoundEmbed();
            await messageReply(embed);
            return SUCCESSFUL_COMMANDRESULT;
        }

        // If not text channel
        if ((channel as Channel).type !== 'text') {
            embed = this.generateNotTextChannelEmbed();
            await messageReply(embed);
            return SUCCESSFUL_COMMANDRESULT;
        }

        // Valid channelId
        setBirthdayChannel(server.serverId, channelId);
        embed = this.generateValidEmbed(channelId);
        await messageReply(embed);
        return SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed for reset
     *
     * @returns RichEmbed
     */
    private generateResetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            EMBED_TITLE,
            CHANNEL_RESETTED,
            Command.EMBED_DEFAULT_COLOUR,
        );
    }

    /**
     * Generate embed if channel is not found
     *
     * @returns RichEmbed
     */
    private generateNotFoundEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            EMBED_TITLE,
            CHANNEL_NOT_FOUND,
            Command.EMBED_ERROR_COLOUR,
        );
    }

    /**
     * Generates embed if not text channel
     *
     * @returns RichEmbed
     */
    private generateNotTextChannelEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            EMBED_TITLE,
            NOT_TEXT_CHANNEL,
            Command.EMBED_ERROR_COLOUR,
        );
    }

    /**
     * Generate embed for valid channel
     *
     * @param  {string} channelId
     * @returns RichEmbed
     */
    private generateValidEmbed(channelId: string): MessageEmbed {
        return this.generateGenericEmbed(
            EMBED_TITLE,
            `Birthday Channel set to <#${channelId}>.`,
            Command.EMBED_DEFAULT_COLOUR,
        );
    }
}
