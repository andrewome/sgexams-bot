import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { SimplifiedEmoji } from '../../storage/StarboardSettings';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardGetEmojiCommand extends Command {
    public static EMOJI_NOT_SET = 'There is no Starboard emoji set for this server.';

    public static EMBED_TITLE = 'Starboard Emoji';

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
