import { CommandResult } from '../classes/CommandResult';
import { CommandCollection } from '../classes/CommandCollection';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class HelpCommand extends HelpCommandBase {
    public static readonly HEADER = '__Available Commands__';

    public static readonly NAME = 'Help';

    public static readonly DESCRIPTION = 'Displays all the available commands that this bot listens to.';

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
            CommandCollection.HELP_COMMANDS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
