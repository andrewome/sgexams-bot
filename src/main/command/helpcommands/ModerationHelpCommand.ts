import { CommandResult } from '../classes/CommandResult';
import { CommandCollection } from '../classes/CommandCollection';
import { HelpCommandBase } from './HelpCommandBase';
import { CommandArgs } from '../classes/CommandArgs';

export class ModerationHelpCommand extends HelpCommandBase {
    public static HEADER = '__Moderation Commands__';

    public static readonly NAME = 'ModHelp';

    public static readonly DESCRIPTION = 'Displays other Moderation commands';

    /**
     * This method sends a help embed for the Moderation module.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { messageReply } = commandArgs;

        // Generate embed and send
        await messageReply({
            embeds: [this.generateEmbed(
                ModerationHelpCommand.HEADER,
                CommandCollection.MODERATION_COMMANDS,
            )],
        });
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
