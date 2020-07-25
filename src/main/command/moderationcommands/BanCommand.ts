import {
    GuildMember, MessageEmbed, Permissions, DiscordAPIError,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class BanCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['BAN_MEMBERS']);

    public static EMBED_TITLE = 'Ban Member';

    public static COMMAND_USAGE = '**Usage:** @bot ban userId [reason] [X{m|h|d}]';

    private type = ModActions.BAN;

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
            await messageReply(this.generateInsufficientArgumentsEmbed());
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');

        // Check last val for ban time if any
        const { length } = this.args;
        const duration = ModUtils.parseDuration(this.args[length - 1]);
        if (duration)
            this.args.pop();

        // Get reason
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);
        // Handle ban
        try {
            const target = await members!.fetch(targetId);
            await target.ban({ reason });
            const curTime = ModUtils.getUnixTime();
            ModDbUtils.addModerationAction(server.serverId, userId!, targetId,
                                           this.type, curTime, emit!, reason, duration);
            // Set timeout if any
            if (duration) {
                const endTime = curTime + duration;
                ModUtils.addBanTimeout(
                    duration, endTime, targetId, server.serverId, botId!, members!, emit!,
                );
            }
            await messageReply(this.generateValidEmbed(target, reason, duration));
        } catch (err) {
            if (err instanceof DiscordAPIError)
                await messageReply(this.generateUserIdErrorEmbed());
            else
                throw err;
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateUserIdErrorEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            BanCommand.EMBED_TITLE,
            `${BanCommand.USERID_ERROR}\n${BanCommand.COMMAND_USAGE}`,
            BanCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateValidEmbed(target: GuildMember, reason: string,
                               duration: number|null): MessageEmbed {
        const embed = this.generateGenericEmbed(
            BanCommand.EMBED_TITLE,
            `${target.user.tag} was banned.`,
            BanCommand.EMBED_DEFAULT_COLOUR,
        );

        embed.addField('Reason', reason || '-', true);
        embed.addField('Length', duration ? `${Math.floor(duration / 60)} minutes` : 'Permanent', true);

        return embed;
    }

    private generateInsufficientArgumentsEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            BanCommand.EMBED_TITLE,
            `${BanCommand.INSUFFICIENT_ARGUMENTS}\n${BanCommand.COMMAND_USAGE}`,
            BanCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
