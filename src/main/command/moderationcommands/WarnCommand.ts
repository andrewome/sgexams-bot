import {
    EmbedBuilder, PermissionsBitField, PermissionFlagsBits, GuildMemberManager,
} from 'discord.js';
import log from 'loglevel';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModerationLog } from '../../modules/moderation/ModerationLog';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { DiscordMemberPort } from '../../modules/moderation/DiscordMemberPort';

export class WarnCommand extends Command {
    public static readonly NAME = 'Warn';

    public static readonly DESCRIPTION = 'Warns a User.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private args: string[];

    private permissions = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers]);

    public static COMMAND_USAGE = '**Usage:** @bot warn userId [reason]';

    public static EMBED_TITLE = 'Warn Member';

    private type = ModActions.WARN;

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
            memberActions, members, server, userId, memberPerms, messageReply, emit, botId,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args
        if (this.args.length < 1) {
            await messageReply({ embeds: [this.generateInsufficientArgumentsEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        const reason = this.args.slice(1).join(' ');

        // Warn
        const result = await memberActions!.lookup(targetId);
        if (!result.ok) {
            await messageReply({ embeds: [this.generateUserIdError()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }
        const curTime = ModUtils.getUnixTime();
        ModerationLog.record(server.serverId, userId!, targetId,
                             this.type, curTime, emit!, reason);
        await messageReply({ embeds: [this.generateValidEmbed(result.tag, reason)] });

        // Handle if this warning hit server warn action threshold
        await this.handleWarnThreshold(server.serverId, targetId, botId!, memberActions!, members, emit!);

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Checks and handles if this warning has hit the server's warn action threshold.
     *
     * @param  {string} serverId
     * @param  {string} targetId
     * @param  {string} botId
     * @param  {DiscordMemberPort} memberActions
     * @param  {GuildMemberManager} members needed only to re-arm a temporary auto-ban's
     *         eventual unban timer - see ADR-0002, ModUtils.addBanTimeout still takes the raw
     *         manager (out of this deepening's scope).
     * @param  {Function} emit
     * @returns Promise
     */
    private async handleWarnThreshold(serverId: string, targetId: string, botId: string,
                                      memberActions: DiscordMemberPort, members: GuildMemberManager | undefined,
                                      emit: Function): Promise<void> {
        // Check if warn threshold has been met
        const numWarns = ModerationLog.warnCount(serverId, targetId);

        // Check if the number corresponds to an action
        const res = ModerationLog.warnRuleFor(serverId, numWarns);

        // If there's a warn action, handle it
        if (res) {
            const curTime = ModUtils.getUnixTime();
            const { type, duration } = res;
            const reason = `**(AUTO)** ${numWarns} warns accumulated`;
            switch (type) {
                case ModActions.BAN: {
                    const result = await memberActions.ban(targetId, { reason });
                    if (!result.ok) {
                        log.warn(`[WarnCommand]: Unable to auto-ban ${targetId} in ${serverId} - unknown user!`);
                        return;
                    }
                    ModerationLog.record(
                        serverId, botId, targetId, ModActions.BAN, curTime, emit, reason, duration,
                    );
                    if (duration) {
                        const endTime = curTime + duration;
                        ModUtils.addBanTimeout(
                            duration, curTime, endTime, targetId, serverId, botId, members!, emit,
                        );
                    }
                    break;
                }
                case ModActions.MUTE: {
                    // Mute via warn escalation requires a duration - permanent mutes are not
                    // supported (see ADR-0001). SetWarnPunishmentsCommand enforces this at
                    // configuration time, so duration should never be null here.
                    if (!duration) {
                        log.warn(
                            `[WarnCommand]: Unable to mute ${targetId} in ${serverId} - no duration configured!`,
                        );
                        return;
                    }

                    const result = await memberActions.timeout(targetId, duration * 1000, reason);
                    if (!result.ok) {
                        log.warn(`[WarnCommand]: Unable to auto-mute ${targetId} in ${serverId} - unknown user!`);
                        return;
                    }
                    ModerationLog.record(serverId, botId, targetId, ModActions.MUTE,
                                         curTime, emit!, reason, duration);
                    const endTime = curTime + duration;
                    ModUtils.addMuteTimeout(
                        duration, curTime, endTime, targetId, serverId, botId!, emit!,
                    );
                    break;
                }
                default:
            }
        }
    }

    private generateUserIdError(): EmbedBuilder {
        return this.generateGenericEmbed(
            WarnCommand.EMBED_TITLE,
            `${WarnCommand.USERID_ERROR}\n${WarnCommand.COMMAND_USAGE}`,
            WarnCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateInsufficientArgumentsEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            WarnCommand.EMBED_TITLE,
            `${WarnCommand.INSUFFICIENT_ARGUMENTS}\n${WarnCommand.COMMAND_USAGE}`,
            WarnCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateValidEmbed(tag: string, reason: string): EmbedBuilder {
        const embed = this.generateGenericEmbed(
            WarnCommand.EMBED_TITLE,
            `${tag} was warned.`,
            WarnCommand.EMBED_DEFAULT_COLOUR,
        );
        return embed.addFields({ name: 'Reason', value: reason || '-' });
    }
}
