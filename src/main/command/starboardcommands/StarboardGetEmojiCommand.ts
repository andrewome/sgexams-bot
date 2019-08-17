import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { SimplifiedEmoji } from '../../storage/StarboardSettings';

export class StarboardGetEmojiCommand extends Command {
    public static COMMAND_NAME = 'GetStarboardEmoji';

    public static COMMAND_NAME_LOWER_CASE = StarboardGetEmojiCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Displays the currently set Starboard emoji';

    public static EMOJI_NOT_SET = 'There is no Starboard emoji set for this server.';

    public static EMBED_TITLE = 'Starboard Emoji';

    /** SaveServer: false, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the getchannel command
     * Sets the Starboard channel of the server.
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

        // Execute
        const emoji = server.starboardSettings.getEmoji();

        // Check if emoji is set
        if (emoji === null) {
            messageReply(this.generateNotSetEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        messageReply(this.generateValidEmbed(emoji));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed if emoji is not set
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotSetEmbed(): RichEmbed {
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(StarboardGetEmojiCommand.EMBED_TITLE,
            StarboardGetEmojiCommand.EMOJI_NOT_SET);

        return embed;
    }

    /**
     * Generates embed if emoji is set
     *
     * @param  {SimplifiedEmoji} emoji
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(emoji: SimplifiedEmoji): RichEmbed {
        const embed = new RichEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        const msg = `Starboard emoji is currently set to <:${emoji.name}:${emoji.id}>.`;
        embed.addField(StarboardGetEmojiCommand.EMBED_TITLE, msg);

        return embed;
    }
}
