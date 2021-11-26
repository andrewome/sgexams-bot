import { CommandResult } from '../classes/CommandResult';
import { CommandCollection } from '../classes/CommandCollection';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardHelpCommand extends HelpCommandBase {
    public static HEADER = '__Starboard Commands__';

    public static readonly NAME = 'StarboardHelp';

    public static readonly DESCRIPTION
        = 'Displays available commands for the Starboard function.';

    /**
     * This method sends a help embed for the Starboard module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;

        // Generate embed and send
        await messageReply({
            embeds: [this.generateEmbed(
                StarboardHelpCommand.HEADER,
                CommandCollection.STARBOARD_COMMANDS,
            )],
        });
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
