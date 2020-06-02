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
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;

        // Generate embed and send
        await messageReply(this.generateEmbed(
            HelpCommand.HEADER,
            CommandNamesAndDescriptions.HELP_COMMANDS,
            CommandNamesAndDescriptions.HELP_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
