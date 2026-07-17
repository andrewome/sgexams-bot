import {
    EmbedBuilder, PermissionsBitField, PermissionFlagsBits,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModerationLog } from '../../modules/moderation/ModerationLog';

export class KickCommand extends Command {
    public static readonly NAME = 'Kick';

    public static readonly DESCRIPTION = 'Kicks a User.';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new PermissionsBitField([PermissionFlagsBits.KickMembers]);

    private args: string[];

    private type = ModActions.KICK;

    public static COMMAND_USAGE = '**Usage:** @bot kick userId [reason]';

    public static EMBED_TITLE = 'Kick Member';

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This method executes the kick command.
     * It kicks the user and update action to database.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            memberActions, server, serverName, userId, memberPerms, messageReply, emit,
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
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        // Resolve the target before DMing them - an invalid/non-member id still gets today's
        // error with no DM sent. See ADR-0005.
        const lookupResult = await memberActions!.lookup(targetId);
        if (!lookupResult.ok) {
            await messageReply({ embeds: [this.generateUserIdErrorEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Sent before the kick, while the target and bot still share this server - Discord
        // requires a mutual server (or an existing DM channel) to open a DM, and a kick
        // severs that. Best-effort: if the kick below then fails, the user will have
        // already received this DM - an accepted, narrower tradeoff. See ADR-0005.
        const noticeEmbed = ModUtils.buildActionNoticeEmbed('kicked', serverName!, reason, userId!);
        const dmResult = await memberActions!.dm(targetId, { embeds: [noticeEmbed] });

        const result = await memberActions!.kick(targetId, reason);
        if (!result.ok) {
            await messageReply({ embeds: [this.generateUserIdErrorEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }
        ModerationLog.record(server.serverId, userId!, targetId,
                             this.type, ModUtils.getUnixTime(), emit!, reason);

        await messageReply({ embeds: [this.generateValidEmbed(result.tag, reason, dmResult.ok)] });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateInsufficientArgumentsEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            KickCommand.EMBED_TITLE,
            `${KickCommand.INSUFFICIENT_ARGUMENTS}\n${KickCommand.COMMAND_USAGE}`,
            KickCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateUserIdErrorEmbed(): EmbedBuilder {
        return this.generateGenericEmbed(
            KickCommand.EMBED_TITLE,
            `${KickCommand.USERID_ERROR}\n${KickCommand.COMMAND_USAGE}`,
            KickCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateValidEmbed(tag: string, reason: string, notified: boolean): EmbedBuilder {
        const embed = this.generateGenericEmbed(
            KickCommand.EMBED_TITLE,
            `${tag} was kicked.`,
            KickCommand.EMBED_DEFAULT_COLOUR,
        );
        embed.addFields({ name: 'Reason', value: reason || '-' });
        ModUtils.addDmFailureNotice(embed, notified);
        return embed;
    }
}
