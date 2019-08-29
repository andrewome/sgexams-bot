import { Permissions } from 'discord.js';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';

export class RotateImageHelpCommand extends HelpCommandBase {
    public static COMMAND_NAME = 'RotateImageHelp';

    public static COMMAND_NAME_LOWER_CASE = RotateImageHelpCommand.COMMAND_NAME.toLowerCase();

    public static DESCRIPTION = 'Displays available commands for the Rotate Image function.';

    public static HEADER = '__Rotate Image Commands__'

    public execute(server: Server,
                   memberPerms: Permissions,
                   messageReply: Function): CommandResult {
        // Generate embed and send
        messageReply(this.generateEmbed(
            RotateImageHelpCommand.HEADER,
            CommandNamesAndDescriptions.ROTATEIMAGE_COMMANDS,
            CommandNamesAndDescriptions.ROTATEIMAGE_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
