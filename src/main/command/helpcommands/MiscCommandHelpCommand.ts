import { CommandResult } from '../classes/CommandResult';
import { CommandCollection } from '../classes/CommandCollection';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class MiscCommandHelpCommand extends HelpCommandBase {
    public static HEADER = '__Miscellaneous Commands__';

    public static readonly NAME = 'MiscHelp';

    public static readonly DESCRIPTION = 'Displays other Miscellaneous commands';

    /**
     * This method sends a help embed for the RotateImage module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;

        // Generate embed and send
        await messageReply({
            embeds: [this.generateEmbed(
                MiscCommandHelpCommand.HEADER,
                CommandCollection.MISC_COMMANDS,
            )],
        });
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
