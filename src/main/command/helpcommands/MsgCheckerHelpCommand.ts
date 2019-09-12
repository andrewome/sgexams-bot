import { Permissions } from 'discord.js';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandNamesAndDescriptions } from '../classes/CommandNamesAndDescriptions';
import { HelpCommandBase } from './HelpCommandBase';

export class MsgCheckerHelpCommand extends HelpCommandBase {
    public static HEADER = '__Message Checker Commands__'

    /**
     * This method sends a help embed for the MsgChecker module.
     * 
     * @param  {Server} server
     * @param  {Permissions} memberPerms
     * @param  {Function} messageReply
     * @returns CommandResult
     */
    public execute(server: Server,
                   memberPerms: Permissions,
                   messageReply: Function): CommandResult {
        // Generate embed and send
        messageReply(this.generateEmbed(
            MsgCheckerHelpCommand.HEADER,
            CommandNamesAndDescriptions.MSGCHECKER_COMMANDS,
            CommandNamesAndDescriptions.MSGCHECKER_DESCRIPTIONS,
        ));
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }
}
