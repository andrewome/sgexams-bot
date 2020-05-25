import {
    Permissions, MessageEmbed,
} from 'discord.js';
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

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    public static EMBED_TITLE = 'Unwarn Member';

    public static COMMAND_USAGE = '**Usage:** @bot unwarn caseId [reason]';

    public static INVALID_CASEID = 'Invalid caseId supplied. Please try again';

    private type = ModActions.UNWARN;

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This method executes the unwarn command.
     * It unwarns the user by supplying a caseId. It deletes the entry from the modlogs entirely.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            userId, server, memberPerms, messageReply, emit,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args (absolute minimum should be 1)
        if (this.args.length < 1) {
            messageReply(this.generateInsufficientArgumentsEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const caseId = parseInt(this.args[0], 10);
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        const successful = ModDbUtils.deleteWarn(server.serverId, caseId);

        // Unsuccessful because of invalid caseid
        if (!successful) {
            messageReply(this.generateInvalidCaseIdEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Update modlogs
        ModDbUtils.addModerationAction(
            server.serverId, userId!, caseId.toString(),
            this.type, ModUtils.getUnixTime(), emit!, reason,
        );
        messageReply(this.generateValidEmbed(caseId.toString(), reason));

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateInsufficientArgumentsEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            UnwarnCommand.EMBED_TITLE,
            `${UnwarnCommand.INSUFFICIENT_ARGUMENTS}\n${UnwarnCommand.COMMAND_USAGE}`,
            UnwarnCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateInvalidCaseIdEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            UnwarnCommand.EMBED_TITLE,
            `${UnwarnCommand.INVALID_CASEID}\n${UnwarnCommand.COMMAND_USAGE}`,
            UnwarnCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateValidEmbed(caseId: string, reason: string): MessageEmbed {
        const embed = this.generateGenericEmbed(
            UnwarnCommand.EMBED_TITLE,
            `Case ${caseId} warn was removed.`,
            UnwarnCommand.EMBED_DEFAULT_COLOUR,
        );
        return embed.addField('Reason', reason || '-');
    }
}
