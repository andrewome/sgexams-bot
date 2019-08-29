import { RichEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';

export abstract class HelpCommandBase extends Command {
    /** SaveServer: false, CheckMessage: true */
    protected COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false, true);

    /**
     * Generates embed to be sent back to user.
     *
     * @param  {string} header Title of command
     * @param  {string[]} commands Commands in the module
     * @param  {string[]} descriptions Descriptions of the commands in the module
     * @returns RichEmbed
     */
    /* eslint-disable class-methods-use-this */
    protected generateEmbed(header: string, commands: string[], descriptions: string[]): RichEmbed {
        const embed = new RichEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);

        let output = '';
        for (let i = 0; i < commands.length; i++) {
            output += `**${commands[i]}** - ${descriptions[i]}\n`;
        }

        embed.addField(header, output);
        return embed;
    }
}
