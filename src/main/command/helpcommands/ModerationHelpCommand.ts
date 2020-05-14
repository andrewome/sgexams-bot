import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class ModerationHelpCommand extends HelpCommandBase {
    public static HEADER = '__Moderation Commands__';

    /**
     * This method sends a help embed for the Moderation module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const { messageReply } = commandArgs;

        // Generate embed and send
        messageReply(this.generateEmbed(
            ModerationHelpCommand.HEADER,
            CommandNamesAndDescriptions.MODERATION_COMMANDS,
            CommandNamesAndDescriptions.MODERATION_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
