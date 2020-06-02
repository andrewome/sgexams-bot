import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { SimplifiedEmoji } from '../../storage/StarboardSettings';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardGetEmojiCommand extends Command {
    public static EMOJI_NOT_SET = 'There is no Starboard emoji set for this server.';

    public static EMBED_TITLE = 'Starboard Emoji';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    /**
     * This function executes the getchannel command
     * Sets the Starboard channel of the server.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { server, memberPerms, messageReply } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        const emojis = server.starboardSettings.getEmoji();

        // Check if emoji is set
        if (emojis.length === 0) {
            await messageReply(this.generateNotSetEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        await messageReply(this.generateValidEmbed(emojis));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed if emoji is not set
     *
     * @returns RichEmbed
     */
    private generateNotSetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            StarboardGetEmojiCommand.EMBED_TITLE,
            StarboardGetEmojiCommand.EMOJI_NOT_SET,
            StarboardGetEmojiCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    /**
     * Generates embed if emoji is set
     *
     * @param  {SimplifiedEmoji} emoji
     */
    private generateValidEmbed(emojis: SimplifiedEmoji[]): MessageEmbed {
        let msg = '';
        for (let i = 0; i < emojis.length; i++) {
            msg += `<:${emojis[i].name}:${emojis[i].id}>`;
            msg += (i === emojis.length - 1) ? '.' : ', ';
        }
        msg = `Starboard emoji(s): ${msg}`;
        return this.generateGenericEmbed(
            StarboardGetEmojiCommand.EMBED_TITLE,
            msg,
            StarboardGetEmojiCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
