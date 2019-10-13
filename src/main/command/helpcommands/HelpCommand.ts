import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class HelpCommand extends HelpCommandBase {
    public static readonly HEADER = '__Available Commands__';

    /**
     * This function lists out the commands that the bot will respond to.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const { messageReply } = commandArgs;

        // Generate embed and send
        messageReply(this.generateEmbed(
            HelpCommand.HEADER,
            CommandNamesAndDescriptions.HELP_COMMANDS,
            CommandNamesAndDescriptions.HELP_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
