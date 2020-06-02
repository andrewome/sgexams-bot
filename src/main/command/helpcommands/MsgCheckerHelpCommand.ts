import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerHelpCommand extends HelpCommandBase {
    public static HEADER = '__Message Checker Commands__'

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
            CommandNamesAndDescriptions.MSGCHECKER_COMMANDS,
            CommandNamesAndDescriptions.MSGCHECKER_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
