import {
    Permissions, MessageEmbed,
} from 'discord.js';
import { SqliteError } from 'better-sqlite3';
import log from 'loglevel';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';
import { ModUtils } from '../../modules/moderation/ModUtil';

export class UnwarnCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private args: string[];

    private permissions = new Permissions(['BAN_MEMBERS']);

    private COMMAND_USAGE = '**Usage:** @bot unwarn caseId [reason]';

    private INVALID_CASEID = 'Invalid caseId supplied. Please try again';

    private type = ModActions.UNWARN;

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This method executes the warn command.
     * It warns the user and update action to database.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            userId, server, memberPerms, messageReply,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args (absolute minimum should be 1)
        if (this.args.length < 1) {
            messageReply(`${UnwarnCommand.INSUFFICIENT_ARGUMENTS}\n${this.COMMAND_USAGE}`);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const caseId = parseInt(this.args[0], 10);
        const reason = this.args.slice(1).join(' ');

        const successful = ModDbUtils.deleteWarn(server.serverId, caseId);

        // Unsuccessful because of invalid caseid
        if (!successful) {
            messageReply(`${this.INVALID_CASEID}\n${this.COMMAND_USAGE}`);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Update modlogs
        ModDbUtils.addModerationAction(
            server.serverId, userId!, caseId.toString(), this.type, ModUtils.getUnixTime(), reason,
        );
        this.sendEmbed(caseId.toString(), reason, messageReply);

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This method sends a messageEmbed of the unban.
     *
     * @param user User
     * @param reason string
     * @param messageReply Function
     */
    private sendEmbed(caseId: string, reason: string,
                      messageReply: Function): void {
        const messageEmbed = new MessageEmbed();

        messageEmbed
            .setTitle(`Case ID ${caseId} warn was removed.`)
            .setColor(UnwarnCommand.EMBED_DEFAULT_COLOUR)
            .addField('Reason', reason || '-');

        messageReply(messageEmbed);
    }
}
