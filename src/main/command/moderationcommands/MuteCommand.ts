import {
    GuildMember, EmbedBuilder, PermissionsBitField, PermissionFlagsBits, DiscordAPIError,
} from 'discord.js';
import log from 'loglevel';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModerationLog } from '../../modules/moderation/ModerationLog';

export class MuteCommand extends Command {
    public static readonly NAME = 'Mute';

    public static readonly DESCRIPTION = 'Mutes a User.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    /**
     * Transitional: mods with the old Kick+Ban permission pair keep working, but Discord itself
     * gates timeouts behind ModerateMembers. See ADR-0001.
     */
    private permissions = new PermissionsBitField([PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers]);

    private permissionsModerateMembers = new PermissionsBitField([PermissionFlagsBits.ModerateMembers]);

    public static EMBED_TITLE = 'Mute Member';

    public static COMMAND_USAGE = '**Usage:** @bot mute userId [reason] X{m|h|d}';

    public static DURATION_REQUIRED = 'A duration is required. Permanent mutes are not supported.';

    public static DURATION_TOO_LONG = 'Duration cannot exceed 21 days.';

    private type = ModActions.MUTE;

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This method executes the mute command.
     * It times the user out and updates the action to the database.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            members, server, userId, memberPerms, messageReply, emit, botId,
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

        // Duration is required - permanent mutes are not supported.
        const { length } = this.args;
        const duration = ModUtils.parseDuration(this.args[length - 1]);
        if (duration === null) {
            await messageReply({ embeds: [this.generateDurationRequiredEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }
        if (duration > ModUtils.MAX_TIMEOUT_DURATION_SECONDS) {
            await messageReply({ embeds: [this.generateDurationTooLongEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }
        this.args.pop();

        // Get reason
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        // Handle mute
        try {
            const target = await members!.fetch(targetId);
            await target.timeout(duration * 1000, reason);
            const curTime = ModUtils.getUnixTime();
            ModerationLog.record(server.serverId, userId!, targetId,
                                 this.type, curTime, emit!, reason, duration);

            // Remove any existing timeout bookkeeping if any, then set a new one
            ModUtils.handleUnmuteTimeout(targetId, server.serverId);
            const endTime = curTime + duration;
            ModUtils.addMuteTimeout(
                duration, curTime, endTime, targetId, server.serverId, botId!, emit!,
            );
            await messageReply({ embeds: [this.generateValidEmbed(target, reason, duration)] });
        } catch (err) {
            if (err instanceof DiscordAPIError) {
                log.info(err);
                await messageReply({ embeds: [this.generateUserIdErrorEmbed()] });
            } else
                throw err;
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateUserIdErrorEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            `${MuteCommand.USERID_ERROR}\n${MuteCommand.COMMAND_USAGE}`,
            MuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateDurationRequiredEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            `${MuteCommand.DURATION_REQUIRED}\n${MuteCommand.COMMAND_USAGE}`,
            MuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateDurationTooLongEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            `${MuteCommand.DURATION_TOO_LONG}\n${MuteCommand.COMMAND_USAGE}`,
            MuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateValidEmbed(target: GuildMember, reason: string, duration: number): EmbedBuilder {
        const embed = this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            `${target.user.tag} was muted.`,
            MuteCommand.EMBED_DEFAULT_COLOUR,
        );

        embed.addFields({ name: 'Reason', value: reason || '-', inline: true });
        embed.addFields({ name: 'Length', value: ModUtils.formatDuration(duration), inline: true });

        return embed;
    }

    private generateInsufficientArgumentsEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            `${MuteCommand.INSUFFICIENT_ARGUMENTS}\n${MuteCommand.COMMAND_USAGE}`,
            MuteCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
