import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class MiscCommandHelpCommand extends HelpCommandBase {
    public static HEADER = '__Miscellaneous Commands__'

    /**
     * This method sends a help embed for the RotateImage module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;

        // Generate embed and send
        await messageReply(this.generateEmbed(
            MiscCommandHelpCommand.HEADER,
            CommandNamesAndDescriptions.MISC_COMMANDS,
            CommandNamesAndDescriptions.MISC_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
