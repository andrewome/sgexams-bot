import {
    GuildMember, MessageEmbed, Permissions, DiscordAPIError, GuildMemberManager,
} from 'discord.js';
import log from 'loglevel';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';
import { ModUtils } from '../../modules/moderation/ModUtil';

export class WarnCommand extends Command {
    public static readonly NAME = 'Warn';

    public static readonly DESCRIPTION = 'Warns a User.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private args: string[];

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

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
            members, server, userId, memberPerms, messageReply, emit, botId,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args
        if (this.args.length < 1) {
            await messageReply(this.generateInsufficientArgumentsEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        const reason = this.args.slice(1).join(' ');

        // Warn
        try {
            const curTime = ModUtils.getUnixTime();
            const target = await members!.fetch(targetId);
            ModDbUtils.addModerationAction(server.serverId, userId!, targetId,
                                           this.type, curTime, emit!, reason);
            await messageReply(this.generateValidEmbed(target, reason));
        } catch (err) {
            if (err instanceof DiscordAPIError)
                await messageReply(this.generateUserIdError());
            else
                throw err;
        }

        // Handle if this warning hit server warn action threshold
        await this.handleWarnThreshold(server.serverId, targetId, botId!, members!, emit!);

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Checks and handles if this warning has hit the server's warn action threshold.
     *
     * @param  {string} serverId
     * @param  {string} targetId
     * @param  {GuildMemberManager} members
     * @returns Promise
     */
    private async handleWarnThreshold(serverId: string, targetId: string, botId: string,
                                      members: GuildMemberManager, emit: Function): Promise<void> {
        // Check if warn threshold has been met
        const numWarns = ModDbUtils.fetchNumberOfWarns(serverId, targetId);

        // Check if the number corresponds to an action
        const res = ModDbUtils.fetchWarnAction(serverId, numWarns);

        // If there's a warn action, handle it
        if (res) {
            const curTime = ModUtils.getUnixTime();
            const { type, duration } = res;
            const reason = `**(AUTO)** ${numWarns} warns accumulated`;
            const target = await members!.fetch(targetId);
            switch (type) {
                case ModActions.BAN:
                    await target.ban({ reason });
                    ModDbUtils.addModerationAction(
                        serverId, botId, targetId, ModActions.BAN, curTime, emit, reason, duration,
                    );
                    if (duration) {
                        const endTime = curTime + duration;
                        ModUtils.addBanTimeout(
                            duration, curTime, endTime, targetId, serverId, botId, members!, emit,
                        );
                    }
                    break;
                case ModActions.MUTE: {
                    // Check if mute role is set
                    const muteRoleId = ModDbUtils.getMuteRoleId(serverId);
                    if (muteRoleId === null) {
                        log.warn(`[WarnCommand]: Unable to mute ${targetId} in ${serverId} - No mute role found!`);
                        return;
                    }

                    // Check if role exists on user
                    const { roles } = target;
                    if (roles.cache.array().some((x) => x.id === muteRoleId)) {
                        log.warn(`[WarnCommand]: ${targetId} in ${serverId} already has the muted role assigned! Ignoring.`);
                        return;
                    }

                    await target.roles.add(muteRoleId);
                    ModDbUtils.addModerationAction(serverId, botId, targetId, ModActions.MUTE,
                                                   curTime, emit!, reason, duration);
                    // Set timeout if any
                    if (duration) {
                        const endTime = curTime + duration;
                        ModUtils.addMuteTimeout(
                            duration, curTime, endTime, targetId, serverId,
                            botId!, members!, emit!, muteRoleId,
                        );
                    }
                    break;
                }
                default:
            }
        }
    }

    private generateUserIdError(): MessageEmbed {
        return this.generateGenericEmbed(
            WarnCommand.EMBED_TITLE,
            `${WarnCommand.USERID_ERROR}\n${WarnCommand.COMMAND_USAGE}`,
            WarnCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateInsufficientArgumentsEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            WarnCommand.EMBED_TITLE,
            `${WarnCommand.INSUFFICIENT_ARGUMENTS}\n${WarnCommand.COMMAND_USAGE}`,
            WarnCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateValidEmbed(target: GuildMember, reason: string): MessageEmbed {
        const embed = this.generateGenericEmbed(
            WarnCommand.EMBED_TITLE,
            `${target.user.tag} was warned.`,
            WarnCommand.EMBED_DEFAULT_COLOUR,
        );
        return embed.addField('Reason', reason || '-');
    }
}
