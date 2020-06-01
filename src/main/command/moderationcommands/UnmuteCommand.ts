import {
    MessageEmbed, Permissions, DiscordAPIError,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class UnmuteCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['BAN_MEMBERS']);

    public static COMMAND_USAGE = '**Usage:** @bot unmute userId [reason]';

    public static EMBED_TITLE = 'Unmute User';

    private type = ModActions.UNMUTE;

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the unmute command.
     * It unmutes the user, updates the moderation logs and removes existing timeout.
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
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args (absolute minimum should be 1)
        if (this.args.length < 1) {
            messageReply(this.generateInsufficientArgumentsEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Check if mute role is set
        const muteRoleId = ModDbUtils.getMuteRoleId(server.serverId);
        if (muteRoleId === null) {
            messageReply(this.generateMuteRoleNotSet());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        // Unmute, add the action and remove the timeout (if any)
        try {
            const target = await members!.fetch(targetId);
            const { roles } = target;

            // Check if role does not exist on user
            if (!roles.cache.array().some((x) => x.id === muteRoleId)) {
                messageReply(this.generateUserNotMutedEmbed());
                return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
            }

            roles.remove(muteRoleId);
            ModDbUtils.addModerationAction(
                server.serverId, userId!, targetId, this.type,
                ModUtils.getUnixTime(), emit!, reason,
            );
            ModUtils.handleUnmuteTimeout(targetId, server.serverId);
            messageReply(this.generateValidEmbed(target.user.tag, reason));
        } catch (err) {
            if (err instanceof DiscordAPIError)
                messageReply(this.generateInvalidUserIdEmbed());
            else
                throw err;
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateUserNotMutedEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            UnmuteCommand.EMBED_TITLE,
            'Target user is not muted.',
            UnmuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateMuteRoleNotSet(): MessageEmbed {
        return this.generateGenericEmbed(
            UnmuteCommand.EMBED_TITLE,
            'Mute role is not set for this server.',
            UnmuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateValidEmbed(username: string, reason: string): MessageEmbed {
        const embed = this.generateGenericEmbed(
            UnmuteCommand.EMBED_TITLE,
            `${username} was unmuted.`,
            UnmuteCommand.EMBED_DEFAULT_COLOUR,
        );
        return embed.addField('Reason', reason || '-');
    }

    private generateInsufficientArgumentsEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            UnmuteCommand.EMBED_TITLE,
            `${UnmuteCommand.INSUFFICIENT_ARGUMENTS}\n${UnmuteCommand.COMMAND_USAGE}`,
            UnmuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateInvalidUserIdEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            UnmuteCommand.EMBED_TITLE,
            `${UnmuteCommand.USERID_ERROR}\n${UnmuteCommand.COMMAND_USAGE}`,
            UnmuteCommand.EMBED_ERROR_COLOUR,
        );
    }
}
