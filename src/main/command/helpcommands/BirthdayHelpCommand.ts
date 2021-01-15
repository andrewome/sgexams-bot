import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class BirthdayHelpCommand extends HelpCommandBase {
    public static HEADER = '__Birthday Commands__';

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
                CommandNamesAndDescriptions.BIRTHDAY_COMMANDS,
                CommandNamesAndDescriptions.BIRTHDAY_DESCRIPTIONS,
            ),
        );
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
