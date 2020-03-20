import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardGetChannelCommand extends Command {
    public static CHANNEL_NOT_SET = 'There is no Starboard channel set for this server.';

    public static EMBED_TITLE = 'Starboard Channel';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the getchannel command
     * Sets the Starboard channel of the server.
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

        // Execute
        const channelId = server.starboardSettings.getChannel();

        // Check if channel is set
        if (channelId === null) {
            messageReply(this.generateNotSetEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        messageReply(this.generateValidEmbed(channelId));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed for if channel is not set
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotSetEmbed(): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(StarboardGetChannelCommand.EMBED_TITLE,
                       StarboardGetChannelCommand.CHANNEL_NOT_SET);

        return embed;
    }

    /**
     * Generates embed if channel exists
     *
     * @param  {string} channelId
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(channelId: string): MessageEmbed {
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        const msg = `Starboard Channel is currently set to <#${channelId}>.`;
        embed.addField(StarboardGetChannelCommand.EMBED_TITLE, msg);

        return embed;
    }
}
