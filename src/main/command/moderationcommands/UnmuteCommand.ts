import {
    EmbedBuilder, PermissionsBitField, PermissionFlagsBits, DiscordAPIError,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class UnmuteCommand extends Command {
    public static readonly NAME = 'Unmute';

    public static readonly DESCRIPTION = 'Unmutes a User.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    /**
     * Transitional: mods with the old Kick+Ban permission pair keep working, but Discord itself
     * gates timeouts behind ModerateMembers. See ADR-0001.
     */
    private permissions = new PermissionsBitField([PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers]);

    private permissionsModerateMembers = new PermissionsBitField([PermissionFlagsBits.ModerateMembers]);

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
     * It unmutes the user, updates the moderation logs and removes existing timeout bookkeeping.
     *
     * @param  {CommandArgs} commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            members, server, userId, memberPerms, messageReply, emit,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasAnyPermissions([this.permissions, this.permissionsModerateMembers], memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args (absolute minimum should be 1)
        if (this.args.length < 1) {
            await messageReply({ embeds: [this.generateInsufficientArgumentsEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        // Unmute, add the action and remove the timeout bookkeeping (if any)
        try {
            const target = await members!.fetch(targetId);
            await target.timeout(null, reason);
            ModDbUtils.addModerationAction(
                server.serverId, userId!, targetId, this.type,
                ModUtils.getUnixTime(), emit!, reason,
            );
            ModUtils.handleUnmuteTimeout(targetId, server.serverId);
            await messageReply({ embeds: [this.generateValidEmbed(target.user.tag, reason)] });
        } catch (err) {
            if (err instanceof DiscordAPIError)
                await messageReply({ embeds: [this.generateInvalidUserIdEmbed()] });
            else
                throw err;
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateValidEmbed(username: string, reason: string): EmbedBuilder {
        const embed = this.generateGenericEmbed(
            UnmuteCommand.EMBED_TITLE,
            `${username} was unmuted.`,
            UnmuteCommand.EMBED_DEFAULT_COLOUR,
        );
        return embed.addFields({ name: 'Reason', value: reason || '-' });
    }

    private generateInsufficientArgumentsEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            UnmuteCommand.EMBED_TITLE,
            `${UnmuteCommand.INSUFFICIENT_ARGUMENTS}\n${UnmuteCommand.COMMAND_USAGE}`,
            UnmuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateInvalidUserIdEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            UnmuteCommand.EMBED_TITLE,
            `${UnmuteCommand.USERID_ERROR}\n${UnmuteCommand.COMMAND_USAGE}`,
            UnmuteCommand.EMBED_ERROR_COLOUR,
        );
    }
}
