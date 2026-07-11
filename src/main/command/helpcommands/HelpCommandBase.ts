import { EmbedBuilder } from 'discord.js';
import { Command, CommandClassRef } from '../Command';
import { CommandResult } from '../classes/CommandResult';

export abstract class HelpCommandBase extends Command {
    /** CheckMessage: true */
    protected COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    /**
     * Generates embed to be sent back to user.
     *
     * @param  {string} header Title of command
     * @param  {CommandClassRef[]} commands Commands in the module
     * @returns RichEmbed
     */
    protected generateEmbed(header: string, commands: CommandClassRef[]): EmbedBuilder {
        const embed = new EmbedBuilder();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);

        const output = commands
            .map((command) => `**${command.NAME}** - ${command.DESCRIPTION}`)
            .join('\n');
        embed.addFields({ name: header, value: output });
        return embed;
    }
}
