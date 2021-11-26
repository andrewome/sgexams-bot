import { CommandResult } from '../classes/CommandResult';
import { CommandCollection } from '../classes/CommandCollection';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerHelpCommand extends HelpCommandBase {
    public static HEADER = '__Message Checker Commands__';

    public static readonly NAME = 'MsgCheckerHelp';

    public static readonly DESCRIPTION = 'Displays available commands for the Message Checker function.';

    /**
     * This method sends a help embed for the MsgChecker module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;

        // Generate embed and send
        await messageReply(this.generateEmbed(
            MsgCheckerHelpCommand.HEADER,
            CommandCollection.MSGCHECKER_COMMANDS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
