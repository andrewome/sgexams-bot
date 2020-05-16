import {
    GuildMember, MessageEmbed, Permissions, DiscordAPIError,
} from 'discord.js';
import log from 'loglevel';
import { SqliteError } from 'better-sqlite3';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/ModActions';

export class KickCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS']);

    private args: string[];

    private type = ModActions.KICK;

    private COMMAND_USAGE = '**Usage:** @bot kick userId reason';

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
    public execute(commandArgs: CommandArgs): CommandResult {
        const {
            members, server, userId, memberPerms, messageReply,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args
        if (this.args.length < 2) {
            messageReply(`${KickCommand.INSUFFICIENT_ARGUMENTS}\n${this.COMMAND_USAGE}`);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const targetId = this.args[0].replace(/[<@!>]/g, '');
        const reason = this.args.slice(1).join(' ');

        members!.fetch(targetId)
            .then((target: GuildMember): void => {
                ModUtils.addModerationAction(server.serverId, userId!, targetId,
                                             this.type, ModUtils.getUnixTime(), reason);
                target.kick();
                this.sendEmbed(target, reason, commandArgs.messageReply);
            })
            .catch((err) => {
                log.warn(err);
                if (err instanceof SqliteError)
                    messageReply(KickCommand.INTERNAL_ERROR_OCCURED);
                else if (err instanceof DiscordAPIError)
                    messageReply(`${KickCommand.USERID_ERROR}\n${this.COMMAND_USAGE}`);
            });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This method sends a messageEmbed of the kick.
     *
     * @param target GuildMember
     * @param reason string
     * @param messageReply Function
     */
    private sendEmbed(target: GuildMember,
                      reason: string,
                      messageReply: Function): void {
        const messageEmbed = new MessageEmbed();

        messageEmbed
            .setTitle(`${target.user.tag} was kicked.`)
            .setColor(KickCommand.EMBED_DEFAULT_COLOUR)
            .addField('Reason', reason || 'No reason given.');

        messageReply(messageEmbed);
    }
}
