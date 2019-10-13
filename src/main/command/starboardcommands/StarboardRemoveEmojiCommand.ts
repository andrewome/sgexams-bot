import { Permissions, RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardRemoveEmojiCommand extends Command {
    public static MAYBE_EMOJI_NOT_INSIDE = 'Emoji was not removed. Perhaps the it was not inside?';

    public static EMBED_TITLE = 'Starboard Emoji';

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
     * This function executes the removeword command
     * Removes the words in the server's banned list array
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const { server, memberPerms, messageReply } = commandArgs;
        const { starboardSettings } = server;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check if there's arguments
        const embed = new RichEmbed();
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
        const successfullyRemoved = starboardSettings.removeEmojiById(emojiId);

        if (successfullyRemoved) {
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            embed.addField(StarboardRemoveEmojiCommand.EMBED_TITLE, `✅Removed Emoji: <:${emoji!.name}:${emoji!.id}>`);
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

    /**
     * Changed the settings of server object
     *
     * @param  {Server} server the discord server
     * @param  {string[]} wordsRemoved Words successfully removed
     * @param  {string[]} wordsNotRemoved Words unsuccessfully removed
     * @returns void
     */
    public changeServerSettings(server: Server,
                                wordsRemoved: string[],
                                wordsNotRemoved: string[]): void {
        const words = this.args;
        for (let word of words) {
            // Make word lowercase
            word = word.toLowerCase();
            if (server.messageCheckerSettings.removeBannedWord(word)) {
                wordsRemoved.push(word);
            } else {
                wordsNotRemoved.push(word);
            }
        }
    }
}
