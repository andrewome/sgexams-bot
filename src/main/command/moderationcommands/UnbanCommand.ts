import {
    MessageEmbed, Permissions, DiscordAPIError, User,
} from 'discord.js';
import { SqliteError } from 'better-sqlite3';
import log from 'loglevel';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/ModActions';

export class UnbanCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['BAN_MEMBERS']);

    private COMMAND_USAGE = '**Usage:** @bot unban userId [reason]';

    private type = ModActions.UNBAN;

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the unban command.
     * It unbans the user, updates the moderation logs and removes existing timeout.
     *
     * @param  {CommandArgs} commandArgs
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

        // Check number of args (absolute minimum should be 1)
        if (this.args.length < 1) {
            messageReply(`${UnbanCommand.INSUFFICIENT_ARGUMENTS}\n${this.COMMAND_USAGE}`);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        let reason: string | null = this.args.slice(1).join(' ');
        if (!reason)
            reason = null;

        // Unban, add the action and remove the timeout (if any)
        members!.unban(targetId)
            .then((user: User) => {
                ModUtils.addModerationAction(
                    server.serverId, userId!, targetId, this.type, ModUtils.getUnixTime(), reason,
                );
                ModUtils.handleUnbanTimeout(targetId, server.serverId);
                this.sendEmbed(user.username, reason, messageReply);
            })
            .catch((err) => {
                log.warn(err);
                if (err instanceof SqliteError)
                    messageReply(UnbanCommand.INTERNAL_ERROR_OCCURED);
                else if (err instanceof DiscordAPIError)
                    messageReply(`${UnbanCommand.USERID_ERROR}\n${this.COMMAND_USAGE}`);
            });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This method sends a messageEmbed of the unban.
     *
     * @param user User
     * @param reason string
     * @param messageReply Function
     */
    private sendEmbed(username: string, reason: string | null,
                      messageReply: Function): void {
        const messageEmbed = new MessageEmbed();

        messageEmbed
            .setTitle(`${username} was unbanned.`)
            .setColor(UnbanCommand.EMBED_DEFAULT_COLOUR)
            .addField('Reason', reason || '-');

        messageReply(messageEmbed);
    }
}
