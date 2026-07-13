import {
    GuildMember, EmbedBuilder, PermissionsBitField, PermissionFlagsBits, DiscordAPIError, User,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModerationLog } from '../../modules/moderation/ModerationLog';

export class BanCommand extends Command {
    public static readonly NAME = 'Ban';

    public static readonly DESCRIPTION = 'Bans a User.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new PermissionsBitField([PermissionFlagsBits.BanMembers]);

    public static EMBED_TITLE = 'Ban Member';

    public static COMMAND_USAGE = '**Usage:** @bot ban userId [reason] [X{m|h|d}]';

    public static DURATION_TOO_LONG = 'Duration cannot exceed 21 days.';

    private type = ModActions.BAN;

    private args: string[];

    private removeMsgs: boolean;

    public constructor(args: string[], removeMsgs?: boolean) {
        super();
        this.args = args;
        this.removeMsgs = removeMsgs ?? false;
    }

    /**
     * This method executes the ban command.
     * It bans the user and update action to database.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            members, server, userId, memberPerms, messageReply, emit, botId,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args (absolute minimum should be 1)
        if (this.args.length < 1) {
            await messageReply({ embeds: [this.generateInsufficientArgumentsEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');

        // Check last val for ban time if any
        const { length } = this.args;
        const duration = ModUtils.parseDuration(this.args[length - 1]);
        if (duration && duration > ModUtils.MAX_TIMEOUT_DURATION_SECONDS) {
            await messageReply({ embeds: [this.generateDurationTooLongEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }
        if (duration)
            this.args.pop();

        // Get reason
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        // Handle ban
        try {
            const bannedUser
                = await members!.ban(targetId, { reason, deleteMessageSeconds: this.removeMsgs ? 86400 : 0 });
            const curTime = ModUtils.getUnixTime();
            ModerationLog.record(server.serverId, userId!, targetId,
                                 this.type, curTime, emit!, reason, duration);

            // Remove any existing timeout if any
            ModUtils.handleUnbanTimeout(targetId, server.serverId);

            // Set timeout if any
            if (duration) {
                const endTime = curTime + duration;
                ModUtils.addBanTimeout(
                    duration, curTime, endTime, targetId, server.serverId, botId!, members!, emit!,
                );
            }
            await messageReply({ embeds: [this.generateValidEmbed(bannedUser, reason, duration)] });
        } catch (err) {
            if (err instanceof DiscordAPIError)
                await messageReply({ embeds: [this.generateUserIdErrorEmbed()] });
            else
                throw err;
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateUserIdErrorEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            BanCommand.EMBED_TITLE,
            `${BanCommand.USERID_ERROR}\n${BanCommand.COMMAND_USAGE}`,
            BanCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateDurationTooLongEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            BanCommand.EMBED_TITLE,
            `${BanCommand.DURATION_TOO_LONG}\n${BanCommand.COMMAND_USAGE}`,
            BanCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateValidEmbed(target: User | GuildMember | string, reason: string,
                               duration: number|null): EmbedBuilder {
        const targetStr = target instanceof String ? target : (target as User).tag;
        const embed = this.generateGenericEmbed(
            BanCommand.EMBED_TITLE,
            `${targetStr} was banned.`,
            BanCommand.EMBED_DEFAULT_COLOUR,
        );

        embed.addFields({ name: 'Reason', value: reason || '-', inline: true });
        embed.addFields({
            name: 'Length', value: duration ? ModUtils.formatDuration(duration) : 'Permanent', inline: true,
        });

        return embed;
    }

    private generateInsufficientArgumentsEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            BanCommand.EMBED_TITLE,
            `${BanCommand.INSUFFICIENT_ARGUMENTS}\n${BanCommand.COMMAND_USAGE}`,
            BanCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
