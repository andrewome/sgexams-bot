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

    public static readonly NAME = 'StarboardAddEmoji';

    public static readonly DESCRIPTION = 'Adds a Starboard emoji that the bot will look out for.';

    /** CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false);

    private COMMAND_UNSUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

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
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            server, memberPerms, messageReply, emojis,
        } = commandArgs;
        const { serverId, starboardSettings } = server;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check if there's arguments
        let embed: MessageEmbed;
        if (this.args.length === 0) {
            embed = this.generateGenericEmbed(
                StarboardAddEmojiCommand.ERROR_EMBED_TITLE,
                StarboardAddEmojiCommand.NO_ARGUMENTS,
                StarboardAddEmojiCommand.EMBED_ERROR_COLOUR,
            );
            await messageReply({ embeds: [embed] });
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        // Add emoji
        const emojiId = this.args[0];

        // Check if valid emoji
        const emoji = emojis!.resolve(emojiId);
        if (emoji === null) {
            embed = this.generateGenericEmbed(
                StarboardAddEmojiCommand.ERROR_EMBED_TITLE,
                StarboardAddEmojiCommand.EMOJI_NOT_FOUND,
                StarboardAddEmojiCommand.EMBED_ERROR_COLOUR,
            );
            await messageReply({ embeds: [embed] });
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        // Add emoji
        const successfullyAdded = starboardSettings.addEmoji(
            serverId,
            new SimplifiedEmoji(emoji!.name!, emoji!.id),
        );

        if (successfullyAdded) {
            embed = this.generateGenericEmbed(
                StarboardAddEmojiCommand.ERROR_EMBED_TITLE,
                `Added Emoji: <:${emoji!.name}:${emoji!.id}>`,
                StarboardAddEmojiCommand.EMBED_DEFAULT_COLOUR,
            );

            // Send output
            await messageReply({ embeds: [embed] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        embed = this.generateGenericEmbed(
            StarboardAddEmojiCommand.ERROR_EMBED_TITLE,
            StarboardAddEmojiCommand.MAYBE_EMOJI_ALREADY_ADDED,
            StarboardAddEmojiCommand.EMBED_ERROR_COLOUR,
        );

        // Send output
        await messageReply({ embeds: [embed] });
        return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
    }
}
