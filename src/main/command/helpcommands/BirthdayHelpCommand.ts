import { CommandResult } from '../classes/CommandResult';
import { CommandCollection } from '../classes/CommandCollection';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class BirthdayHelpCommand extends HelpCommandBase {
    public static HEADER = '__Birthday Commands__';

    public static readonly NAME = 'BirthdayHelp';

    public static readonly DESCRIPTION = 'Displays other Birthday commands';

    /**
     * This method sends a help embed for the Birthday module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;

        // Generate embed and send
        await messageReply(
            this.generateEmbed(
                BirthdayHelpCommand.HEADER,
                CommandCollection.BIRTHDAY_COMMANDS,
            ),
        );
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
