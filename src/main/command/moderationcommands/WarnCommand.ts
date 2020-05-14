import { GuildMember, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { DatabaseConnection } from '../../DatabaseConnection';
import { Server } from '../../storage/Server';

export class WarnCommand extends Command {
    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private commandArgs: string[];

    public constructor(args: string[]) {
        super();
        this.commandArgs = args;
    }

    /**
     * This method executes the warn command.
     * It warns the user and update action to database.
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public execute(commandArgs: CommandArgs): CommandResult {
        const {
            members, deleteFunction, server, userId,
        } = commandArgs;
        const targetId = this.commandArgs[0].replace(/[<@!>]/g, '');
        const reason = this.commandArgs.slice(1).join(' ');

        // Delete message that sent this command to prevent spam.
        deleteFunction!();

        // eslint-disable-next-line no-unused-expressions
        members?.fetch(targetId)
            .then((target: GuildMember): void => {
                this.addModerationActions(server, target, reason, userId);
                this.addModerationCounts(server, target);
                this.sendEmbed(target, reason, commandArgs.messageReply);
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch((): void => {}); // Do nothing

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This method logs the action to moderationActions table.
     *
     * @param server Server
     * @param target GuildMember
     * @param reason string
     * @param userId string
     */
    private addModerationActions(server: Server,
                                 target: GuildMember,
                                 reason: string,
                                 userId?: string): void {
        const db = DatabaseConnection.connect();

        const caseId = db.prepare('SELECT caseId FROM moderationActions').all().reverse()[0] ?
            db.prepare('SELECT caseId FROM moderationActions').all().reverse()[0] : 0;

        db.prepare(`
            INSERT INTO moderationActions (serverId, caseId, id, modId, action, reason)
            VALUES (${server.serverId}, ${caseId + 1}, ${target.id}, ${userId}, 'Warn', '${reason}')
        `).run();

        db.close();
    }

    /**
     * This method logs the action to moderationCounts table.
     *
     * @param server Server
     * @param target GuildMember
     */
    private addModerationCounts(server: Server,
                                target: GuildMember): void {
        const db = DatabaseConnection.connect();

        const userLog = db.prepare(`SELECT * FROM moderationCounts WHERE id = ${target.id}`).get();

        if (userLog) {
            db.prepare(`
                UPDATE moderationCounts
                SET warnCounts = ${userLog.warnCounts + 1}
                WHERE id = ${target.id}
            `).run();
        } else {
            db.prepare(`
                INSERT INTO moderationCounts 
                VALUES (${server.serverId}, ${target.id}, 1, 0, 0, 0)
            `).run();
        }

        db.close();
    }

    /**
     * This method sends a messageEmbed of the warn.
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
            .setTitle(`${target.user.tag} was warned.`)
            .setThumbnail(target.user.displayAvatarURL())
            .setColor(target.displayHexColor)
            .addField('Reason', reason || 'No reason given.');

        messageReply(messageEmbed);
    }
}
