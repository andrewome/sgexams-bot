import {
 RichEmbed, Permissions, Emoji, Collection, Channel,
} from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { SimplifiedEmoji } from '../../storage/StarboardSettings';

export class SetStarboardEmojiCommand extends Command {
    public static COMMAND_NAME = 'SetStarboardEmoji';

    public static COMMAND_NAME_LOWER_CASE = SetStarboardEmojiCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Sets the Starboard emoji that the bot will look out for.'

    public static EMOJI_NOT_FOUND = 'Emoji was not found. Please submit a valid Emoji ID.';

    public static EMBED_TITLE = 'Starboard Emoji';

    public static EMOJI_RESETTED = 'Starboard Emoji has been resetted because there were no arguments. Please set a new one.';

    public static EMOJIID_CANNOT_BE_UNDEFINED = 'Emoji ID cannot be undefined!';

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
                     Channel)[]): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        let embed: RichEmbed;
        const emojis = args[1];

        // If no args
        if (this.args.length === 0) {
            embed = this.generateResetEmbed();
            server.starboardSettings.setEmoji(null);
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const emojiId = this.args[0];

        // Check if valid emoji
        const emoji = (emojis as Collection<string, Emoji>).get(emojiId);
        if (typeof emoji === 'undefined') {
            embed = this.generateNotFoundEmbed();
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        embed = this.generateValidEmbed(emoji as Emoji);
        const simplifiedEmoji
            = new SimplifiedEmoji((emoji as Emoji).name, emoji.id);
        server.starboardSettings.setEmoji(simplifiedEmoji);
        messageReply(embed);
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
        embed.addField(SetStarboardEmojiCommand.EMBED_TITLE,
            SetStarboardEmojiCommand.EMOJI_RESETTED);

        return embed;
    }

    /**
     * Generates embed if emoji not found
     *
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateNotFoundEmbed(): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(SetStarboardEmojiCommand.EMBED_TITLE,
            SetStarboardEmojiCommand.EMOJI_NOT_FOUND);

        return embed;
    }

    /**
     * Generates embed for valid emoji
     *
     * @param  {Emoji} emoji
     * @returns RichEmbed
     */
    // eslint-disable-next-line class-methods-use-this
    private generateValidEmbed(emoji: Emoji): RichEmbed {
        const embed = new RichEmbed();
        const msg = `Starboard Emoji set to <:${emoji.name}:${emoji.id}>.`;
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.addField(SetStarboardEmojiCommand.EMBED_TITLE, msg);

        return embed;
    }
}
