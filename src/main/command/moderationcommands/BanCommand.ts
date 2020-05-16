import {
    GuildMember, MessageEmbed, Permissions, DiscordAPIError,
} from 'discord.js';
import { SqliteError } from 'better-sqlite3';
import log from 'loglevel';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/ModActions';

export class BanCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['BAN_MEMBERS']);

    private COMMAND_USAGE = '**Usage:** @bot ban userId reason [X{m|h|d}]'

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
    public execute(commandArgs: CommandArgs): CommandResult {
        const {
            members, server, userId, memberPerms, messageReply,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args (absolute minimum should be 2)
        if (this.args.length < 2) {
            messageReply(`${BanCommand.INSUFFICIENT_ARGUMENTS}\n${this.COMMAND_USAGE}`);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        const { length } = this.args;
        const duration = ModUtils.parseDuration(this.args[length - 1]);
        let durationStr: string | undefined;
        if (duration)
            durationStr = this.args.pop();
        const reason = this.args.slice(1).join(' ');

        // No reason was given
        if (!reason) {
            messageReply(`${BanCommand.MISSING_REASON}\n${this.COMMAND_USAGE}`);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        members!.fetch(targetId)
            .then((target: GuildMember): void => {
                target.ban({ reason });
                const curTime = ModUtils.getUnixTime();
                ModUtils.addModerationAction(server.serverId, userId!, targetId,
                                             this.type, curTime, reason);

                // Set timeout if any
                if (duration) {
                    const endTime = curTime + duration;
                    ModUtils.addBanTimeout(duration, endTime, targetId, server.serverId, members!);
                }
                this.sendEmbed(target, reason, messageReply, durationStr);
            })
            .catch((err) => {
                log.warn(err);
                if (err instanceof SqliteError)
                    messageReply(BanCommand.INTERNAL_ERROR_OCCURED);
                else if (err instanceof DiscordAPIError)
                    messageReply(`${BanCommand.USERID_ERROR}\n${this.COMMAND_USAGE}`);
            });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This method sends a messageEmbed of the ban.
     *
     * @param target GuildMember
     * @param reason string
     * @param messageReply Function
     */
    private sendEmbed(target: GuildMember, reason: string,
                      messageReply: Function, durationStr?: string): void {
        const messageEmbed = new MessageEmbed();

        messageEmbed
            .setTitle(`${target.user.tag} was banned.`)
            .setColor(BanCommand.EMBED_DEFAULT_COLOUR)
            .addField('Reason', reason, true);
        if (durationStr)
            messageEmbed.addField('Length', durationStr, true);

        messageReply(messageEmbed);
    }
}
