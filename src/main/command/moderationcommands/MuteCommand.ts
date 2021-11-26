import {
    GuildMember, MessageEmbed, Permissions, DiscordAPIError,
} from 'discord.js';
import log from 'loglevel';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class MuteCommand extends Command {
    public static readonly NAME = 'Mute';

    public static readonly DESCRIPTION = 'Mutes a User.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['BAN_MEMBERS', 'KICK_MEMBERS']);

    public static EMBED_TITLE = 'Mute Member';

    public static COMMAND_USAGE = '**Usage:** @bot mute userId [reason] [X{m|h|d}]';

    private type = ModActions.MUTE;

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
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

        // Check if mute role is set
        const muteRoleId = ModDbUtils.getMuteRoleId(server.serverId);
        if (muteRoleId === null) {
            await messageReply({ embeds: [this.generateMuteRoleNotSet()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');

        // Check last val for mute time if any
        const { length } = this.args;
        const duration = ModUtils.parseDuration(this.args[length - 1]);
        if (duration)
            this.args.pop();

        // Get reason
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        // Handle mute
        try {
            const target = await members!.fetch(targetId);
            const { roles } = target;

            // Check if role exists on user
            if (roles.cache.some((x) => x.id === muteRoleId)) {
                await messageReply({ embeds: [this.generateUserAlreadyMutedEmbed()] });
                return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
            }
            await target.roles.add(muteRoleId);
            const curTime = ModUtils.getUnixTime();
            ModDbUtils.addModerationAction(server.serverId, userId!, targetId,
                                           this.type, curTime, emit!, reason, duration);

            // Remove any existing timeout if any
            ModUtils.handleUnmuteTimeout(targetId, server.serverId);

            // Set timeout if any
            if (duration) {
                const endTime = curTime + duration;
                ModUtils.addMuteTimeout(
                    duration, curTime, endTime, targetId, server.serverId,
                    botId!, members!, emit!, muteRoleId,
                );
            }
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

    private generateUserAlreadyMutedEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            'Target user already muted.',
            MuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateMuteRoleNotSet(): MessageEmbed {
        return this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            'Mute role is not set for this server.',
            MuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateUserIdErrorEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            `${MuteCommand.USERID_ERROR}\n${MuteCommand.COMMAND_USAGE}`,
            MuteCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateValidEmbed(target: GuildMember, reason: string,
                               duration: number|null): MessageEmbed {
        const embed = this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            `${target.user.tag} was muted.`,
            MuteCommand.EMBED_DEFAULT_COLOUR,
        );

        embed.addField('Reason', reason || '-', true);
        embed.addField('Length', duration ? `${Math.floor(duration / 60)} minutes` : 'Permanent', true);

        return embed;
    }

    private generateInsufficientArgumentsEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            MuteCommand.EMBED_TITLE,
            `${MuteCommand.INSUFFICIENT_ARGUMENTS}\n${MuteCommand.COMMAND_USAGE}`,
            MuteCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
