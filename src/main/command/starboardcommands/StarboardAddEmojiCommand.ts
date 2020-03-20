import {
    Permissions, MessageEmbed,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { SimplifiedEmoji } from '../../storage/StarboardSettings';

export class StarboardAddEmojiCommand extends Command {
    public static EMOJI_NOT_FOUND = 'Emoji was not found. Please submit a valid Emoji ID.';

    public static EMBED_TITLE = 'Starboard Emoji';

    public static MAYBE_EMOJI_ALREADY_ADDED = 'Emoji was not added. Perhaps the it was already added?';

    /** SaveServer: true, CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true, false);

    private COMMAND_UNSUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the addword command
     * Adds word(s) to the banned list array of the server
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const {
            server, memberPerms, messageReply, emojis,
        } = commandArgs;
        const { starboardSettings } = server;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check if there's arguments
        const embed = new MessageEmbed();
        if (this.args.length === 0) {
            embed.setColor(Command.EMBED_ERROR_COLOUR);
            embed.addField(
                StarboardAddEmojiCommand.ERROR_EMBED_TITLE,
                StarboardAddEmojiCommand.NO_ARGUMENTS,
            );
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        // Add emoji
        const emojiId = this.args[0];

        // Check if valid emoji
        const emoji = emojis!.resolve(emojiId);
        if (emoji === null) {
            embed.setColor(Command.EMBED_ERROR_COLOUR);
            embed.addField(
                StarboardAddEmojiCommand.EMBED_TITLE,
                StarboardAddEmojiCommand.EMOJI_NOT_FOUND,
            );
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        // Add emoji
        const successfullyAdded
            = starboardSettings.addEmoji(new SimplifiedEmoji(emoji!.name, emoji!.id));

        if (successfullyAdded) {
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(StarboardAddEmojiCommand.EMBED_TITLE, `Added Emoji: <:${emoji!.name}:${emoji!.id}>`);

            // Send output
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(
            StarboardAddEmojiCommand.EMBED_TITLE,
            StarboardAddEmojiCommand.MAYBE_EMOJI_ALREADY_ADDED,
        );

        // Send output
        messageReply(embed);
        return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
    }
}
