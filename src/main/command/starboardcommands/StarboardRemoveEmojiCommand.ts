import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardRemoveEmojiCommand extends Command {
    public static MAYBE_EMOJI_NOT_INSIDE = 'Emoji was not removed. Perhaps the it was not inside?';

    public static EMBED_TITLE = 'Starboard Emoji';

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
     * This function executes the removeword command
     * Removes the words in the server's banned list array
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const { server, memberPerms, messageReply } = commandArgs;
        const { serverId, starboardSettings } = server;

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
                StarboardRemoveEmojiCommand.ERROR_EMBED_TITLE,
                StarboardRemoveEmojiCommand.NO_ARGUMENTS,
            );
            messageReply(embed);
            return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
        }

        // Execute
        const emojiId = this.args[0];
        const emoji = starboardSettings.getEmojiById(emojiId);
        const successfullyRemoved = starboardSettings.removeEmojiById({
            serverId, emojiId,
        });

        if (successfullyRemoved) {
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(StarboardRemoveEmojiCommand.EMBED_TITLE, `Removed Emoji: <:${emoji!.name}:${emoji!.id}>`);
            // Send output
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        embed.setColor(Command.EMBED_ERROR_COLOUR);
        embed.addField(
            StarboardRemoveEmojiCommand.EMBED_TITLE,
            StarboardRemoveEmojiCommand.MAYBE_EMOJI_NOT_INSIDE,
        );
        // Send output
        messageReply(embed);
        return this.COMMAND_UNSUCCESSFUL_COMMANDRESULT;
    }
}
