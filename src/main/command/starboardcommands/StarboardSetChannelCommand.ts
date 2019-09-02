import {
  RichEmbed, Permissions, Collection, Channel, Emoji,
} from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardSetChannelCommand extends Command {
    public static NOT_TEXT_CHANNEL = 'Channel is not a Text Channel. Make sure the Channel you are submitting is a Text Channel';

    public static CHANNEL_NOT_FOUND = 'Channel was not found. Please submit a valid channel ID.';

    public static EMBED_TITLE = 'Starboard Channel';

    public static CHANNEL_RESETTED = 'Starboard Channel has been resetted because there were no arguments. Please set a new one.';

    public static CHANNELID_CANNOT_BE_UNDEFINED = 'Channel ID cannot be undefined!';

    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);

    private COMMAND_UNSUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the setstarboardchannel command
     * Sets the starboard channel of the server.
     *
     * @param  {Server} server Server object of the message
     * @param  {Message} message Message object from the bot's on message event
     * @returns CommandResult
     */
    public execute(server: Server,
                   memberPerms: Permissions,
                   messageReply: Function,
                   ...args:
                    (Collection<string, Channel> |
                     Collection<string, Emoji> |
                     CommandArgs)[]): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        let embed: RichEmbed;
        const channels = args[0];

        // If no args
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            messageReply(embed);
            server.starboardSettings.setChannel(null);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const channelId = this.args[0];
        const channel = (channels as Collection<string, Channel>).get(channelId);

        // Check if valid channel
        if (typeof channel === 'undefined') {
            embed = this.generateNotFoundEmbed();
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        // If not text channel
        if ((channel as Channel).type !== 'text') {
            embed = this.generateNotTextChannelEmbed();
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        embed = this.generateValidEmbed(channelId);
        server.starboardSettings.setChannel(channelId);
        messageReply(embed);
        server.starboardSettings.setChannel(channelId);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed for reset
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateResetEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(StarboardSetChannelCommand.EMBED_TITLE,
            StarboardSetChannelCommand.CHANNEL_RESETTED);

        return embed;
    }

    /**
     * Generate embed if channel is not found
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotFoundEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(StarboardSetChannelCommand.EMBED_TITLE,
            StarboardSetChannelCommand.CHANNEL_NOT_FOUND);

        return embed;
    }

    /**
     * Generates embed if not text channel
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotTextChannelEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(StarboardSetChannelCommand.EMBED_TITLE,
            StarboardSetChannelCommand.NOT_TEXT_CHANNEL);

        return embed;
    }

    /**
     * Generate embed for valid channel
     *
     * @param  {string} channelId
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(channelId: string): RichEmbed {
        const embed = new RichEmbed();
        const msg = `Starboard Channel set to <#${channelId}>.`;
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(StarboardSetChannelCommand.EMBED_TITLE, msg);

        return embed;
    }
}
