import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class StarboardHelpCommand extends HelpCommandBase {
    public static HEADER = '__Starboard Commands__';

    /**
     * This method sends a help embed for the Starboard module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;

        // Generate embed and send
        await messageReply(this.generateEmbed(
            StarboardHelpCommand.HEADER,
            CommandNamesAndDescriptions.STARBOARD_COMMANDS,
            CommandNamesAndDescriptions.STARBOARD_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
