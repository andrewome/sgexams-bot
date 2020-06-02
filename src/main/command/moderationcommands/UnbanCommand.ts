import {
    MessageEmbed, Permissions, DiscordAPIError,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class UnbanCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['BAN_MEMBERS']);

    public static COMMAND_USAGE = '**Usage:** @bot unban userId [reason]';

    public static EMBED_TITLE = 'Unban User';

    private type = ModActions.UNBAN;

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the unban command.
     * It unbans the user, updates the moderation logs and removes existing timeout.
     *
     * @param  {CommandArgs} commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            members, server, userId, memberPerms, messageReply, emit,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args (absolute minimum should be 1)
        if (this.args.length < 1) {
            await messageReply(this.generateInsufficientArgumentsEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        // Unban, add the action and remove the timeout (if any)
        try {
            const user = await members!.unban(targetId);
            ModDbUtils.addModerationAction(
                server.serverId, userId!, targetId, this.type,
                ModUtils.getUnixTime(), emit!, reason,
            );
            ModUtils.handleUnbanTimeout(targetId, server.serverId);
            await messageReply(this.generateValidEmbed(user.username, reason));
        } catch (err) {
            if (err instanceof DiscordAPIError)
                await messageReply(this.generateInvalidUserIdEmbed());
            else
                throw err;
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateValidEmbed(username: string, reason: string): MessageEmbed {
        const embed = this.generateGenericEmbed(
            UnbanCommand.EMBED_TITLE,
            `${username} was unbanned.`,
            UnbanCommand.EMBED_DEFAULT_COLOUR,
        );
        return embed.addField('Reason', reason || '-');
    }

    private generateInsufficientArgumentsEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            UnbanCommand.EMBED_TITLE,
            `${UnbanCommand.INSUFFICIENT_ARGUMENTS}\n${UnbanCommand.COMMAND_USAGE}`,
            UnbanCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateInvalidUserIdEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            UnbanCommand.EMBED_TITLE,
            `${UnbanCommand.USERID_ERROR}\n${UnbanCommand.COMMAND_USAGE}`,
            UnbanCommand.EMBED_ERROR_COLOUR,
        );
    }
}
