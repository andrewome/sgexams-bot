import { Permissions } from 'discord.js';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';

export class StarboardHelpCommand extends HelpCommandBase {
    public static HEADER = '__Starboard Commands__';

    public execute(server: Server,
                   memberPerms: Permissions,
                   messageReply: Function): CommandResult {
        // Generate embed and send
        messageReply(this.generateEmbed(
            StarboardHelpCommand.HEADER,
            CommandNamesAndDescriptions.STARBOARD_COMMANDS,
            CommandNamesAndDescriptions.STARBOARD_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
