import {
 Message, RichEmbed, Permissions, Emoji,
} from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';

export enum ResponseType {
    RESET = 0,
    UNDEFINED = 1,
    VALID = 2
}

export class SetStarboardEmojiCommand extends Command {
    public static COMMAND_NAME = 'SetStarboardEmoji';

    public static COMMAND_NAME_LOWER_CASE = 'setstarboardemoji';

    public static DESCRIPTION = 'Sets the Starboard emoji that the bot will look out for.'

    public static EMOJI_NOT_FOUND = 'Emoji was not found. Please submit a valid Emoji ID.';

    public static EMBED_TITLE = 'Starboard Emoji';

    public static EMOJI_RESETTED = 'Starboard Emoji has been resetted because there were no arguments. Please set a new one.';

    public static EMOJIID_CANNOT_BE_UNDEFINED = 'Emoji ID cannot be undefined!';

    /** SaveServer: true, CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, true);

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
    public execute(server: Server, message: Message): CommandResult {
        // Check for permissions first
        if (!this.hasPermissions(this.permissions, message.member.permissions)) {
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        let embed: RichEmbed;
        if (this.args.length === 0) {
            embed = this.generateEmbed(ResponseType.RESET);
            this.changeServerSettings(server, null);
        } else {
            const emojiId = this.args[0];

            // Check if valid channel
            const emoji = message.guild.emojis.get(emojiId);
            if (typeof emoji === 'undefined') {
                embed = this.generateEmbed(ResponseType.UNDEFINED);
            } else {
                embed = this.generateEmbed(ResponseType.VALID, emoji);
                this.changeServerSettings(server, emoji);
            }
        }
        message.channel.send(embed);
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates embed that is sent back to user
     *
     * @param  {ResponseType} type RESET/UNDEFINED/VALID
     * @param  {Emnoji} emoji?
     * @returns RichEmbed
     */
    /* eslint-disable class-methods-use-this */
    public generateEmbed(type: ResponseType, emoji?: Emoji): RichEmbed {
        const embed = new RichEmbed();
        if (type === ResponseType.RESET) {
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(SetStarboardEmojiCommand.EMBED_TITLE,
                SetStarboardEmojiCommand.EMOJI_RESETTED);
        }
        if (type === ResponseType.UNDEFINED) {
            embed.setColor(Command.EMBED_ERROR_COLOUR);
            embed.addField(SetStarboardEmojiCommand.EMBED_TITLE,
                SetStarboardEmojiCommand.EMOJI_NOT_FOUND);
        }
        if (type === ResponseType.VALID) {
            if (emoji === undefined) {
                throw new Error(SetStarboardEmojiCommand.EMOJIID_CANNOT_BE_UNDEFINED);
            }
            const msg = `Starboard Emoji set to <:${emoji.name}:${emoji.id}>.`;
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(SetStarboardEmojiCommand.EMBED_TITLE, msg);
        }
        return embed;
    }

    /**
     * Sets the starboard channel of the server
     *
     * @param  {Server} server
     * @param  {emoji|null} emoji emoji.
     * @returns void
     */
    public changeServerSettings(server: Server, emoji: Emoji | null): void {
        server.starboardSettings.setEmoji(emoji);
    }
    /* eslint-enable class-methods-use-this */
}
