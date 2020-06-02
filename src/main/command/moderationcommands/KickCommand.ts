import {
    GuildMember, MessageEmbed, Permissions, DiscordAPIError,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class KickCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS']);

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
            members, server, userId, memberPerms, messageReply, emit,
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
        let reason = this.args.slice(1).join(' ');
        if (reason.length > 512)
            reason = reason.substr(0, 512);

        try {
            const target = await members!.fetch(targetId);
            ModDbUtils.addModerationAction(server.serverId, userId!, targetId,
                                           this.type, ModUtils.getUnixTime(), emit!, reason);
            await target.kick();
            await messageReply(this.generateValidEmbed(target, reason));
        } catch (err) {
            if (err instanceof DiscordAPIError)
                await messageReply(this.generateUserIdErrorEmbed());
            else
                throw err;
        }

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateInsufficientArgumentsEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            KickCommand.EMBED_TITLE,
            `${KickCommand.INSUFFICIENT_ARGUMENTS}\n${KickCommand.COMMAND_USAGE}`,
            KickCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateUserIdErrorEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            KickCommand.EMBED_TITLE,
            `${KickCommand.USERID_ERROR}\n${KickCommand.COMMAND_USAGE}`,
            KickCommand.EMBED_ERROR_COLOUR,
        );
    }

    private generateValidEmbed(target: GuildMember, reason: string): MessageEmbed {
        const embed = this.generateGenericEmbed(
            KickCommand.EMBED_TITLE,
            `${target.user.tag} was kicked.`,
            KickCommand.EMBED_DEFAULT_COLOUR,
        );
        return embed.addField('Reason', reason || '-');
    }
}
