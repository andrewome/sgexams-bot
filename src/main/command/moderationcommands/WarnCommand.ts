import {
    GuildMember, MessageEmbed, Permissions, DiscordAPIError, GuildMemberManager,
} from 'discord.js';
import { SqliteError } from 'better-sqlite3';
import log from 'loglevel';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';
import { ModUtils } from '../../modules/moderation/ModUtil';

export class WarnCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private args: string[];

    private permissions = new Permissions(['BAN_MEMBERS']);

    private COMMAND_USAGE = '**Usage:** @bot warn userId [reason]';

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
            members, server, userId, memberPerms, messageReply,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        const reason = this.args.slice(1).join(' ');

        // Warn
        try {
            const curTime = ModUtils.getUnixTime();
            const target = await members!.fetch(targetId);
            ModDbUtils.addModerationAction(server.serverId, userId!, targetId,
                                           this.type, curTime, reason);
            this.sendEmbed(target, reason, messageReply);
        } catch (err) {
            log.warn(err);
            if (err instanceof SqliteError)
                messageReply(WarnCommand.INTERNAL_ERROR_OCCURED);
            else if (err instanceof DiscordAPIError)
                messageReply(`${WarnCommand.USERID_ERROR}\n${this.COMMAND_USAGE}`);
        }

        // Handle if this warning hit server warn action threshold
        this.handleWarnThreshold(server.serverId, targetId, members!);

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
    private async handleWarnThreshold(serverId: string, targetId: string,
                                      members: GuildMemberManager): Promise<void> {
        // Check if warn threshold has been met
        const numWarns = ModDbUtils.fetchNumberOfWarns(serverId, targetId);

        // Check if the number corresponds to an action
        const res = ModDbUtils.fetchWarnAction(serverId, numWarns);

        // If there's a warn action, handle it
        if (res) {
            const curTime = ModUtils.getUnixTime();
            const { action, duration } = res;
            const reason = `AUTO - ${numWarns} Warns Accumulated`;
            const target = await members!.fetch(targetId);
            switch (action) {
                case ModActions.BAN:
                    target.ban({ reason });
                    ModDbUtils.addModerationAction(
                        serverId, 'AUTO', targetId, ModActions.BAN, curTime, reason, duration,
                    );
                    if (duration) {
                        const endTime = curTime + duration;
                        ModUtils.addBanTimeout(
                            duration, endTime, targetId, serverId, members!,
                        );
                    }
                    break;
                case ModActions.MUTE:
                    break;
                default:
            }
        }
    }

    /**
     * This method sends a messageEmbed of the warn.
     *
     * @param target GuildMember
     * @param reason string
     * @param messageReply Function
     */
    private sendEmbed(target: GuildMember, reason: string,
                      messageReply: Function): void {
        const messageEmbed = new MessageEmbed();

        messageEmbed
            .setTitle(`${target.user.tag} was warned.`)
            .setColor(WarnCommand.EMBED_DEFAULT_COLOUR)
            .addField('Reason', reason || '-');

        messageReply(messageEmbed);
    }
}
