import {
    Permissions, MessageEmbed, MessageReaction, User, Message,
} from 'discord.js';
import { Command } from '../Command';
import { CommandArgs } from '../classes/CommandArgs';
import { CommandResult } from '../classes/CommandResult';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';
import { ModLog } from '../../modules/moderation/classes/ModLog';
import { ModActions } from '../../modules/moderation/classes/ModActions';

export class ModLogsCommand extends Command {
    public static readonly NAME = 'ModLogs';

    public static readonly DESCRIPTION = 'Displays Moderation Logs';

    private static PAGE_SIZE = 4;

    private static EMBED_TITLE = 'Mod Logs';

    private static NEXT = '➡️';

    private static PREV = '⬅️';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT = new CommandResult(true);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private ERROR_MESSAGE = this.generateGenericEmbed(
        ModLogsCommand.EMBED_TITLE,
        `Failed to retrieve moderation logs.
        **Usage:** @bot modLogs [userId] [type]
        `,
        Command.EMBED_ERROR_COLOUR,
    );

    private userId: string | null = null;

    private type: string | null = null;

    private complementType: string | null = null;

    constructor(args: string[]) {
        super();

        if (args.length === 1) {
            if (args[0].toUpperCase() in ModActions) {
                // The argument is a `type` argument
                [this.type] = args;
                this.type = this.type.toUpperCase();
                this.complementType = `UN${this.type}`;
            } else {
                [this.userId] = args;
            }
        } else if (args.length === 2) {
            [this.userId, this.type] = args;
            this.type = this.type.toUpperCase();
            this.complementType = `UN${this.type}`;
        }
        if (this.userId)
            this.userId = this.userId.replace(/[<@!>]/g, '');
    }

    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            server, memberPerms, messageReply, userId,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Retrieve mod logs and sort them in descending order of caseId
        const mainModLogs = ModDbUtils.getModLogs(server.serverId, this.userId, this.type);
        let complementModLogs: ModLog[] = [];
        if (this.complementType !== null) {
            complementModLogs = ModDbUtils.getModLogs(
                server.serverId, this.userId, this.complementType,
            );
        }
        const modLogs = [...mainModLogs, ...complementModLogs];
        modLogs.sort((a, b) => {
            if (a.caseId < b.caseId) return 1;
            if (a.caseId > b.caseId) return -1;
            return 0;
        });

        // Display a special message if there are no mod logs
        if (modLogs.length === 0) {
            const embed = new MessageEmbed();
            embed.setTitle('Mod logs is empty');
            await messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const endStartIdx = Math.ceil(modLogs.length / ModLogsCommand.PAGE_SIZE);
        let curStartIdx = 0;

        // Send the initial message
        let embed: MessageEmbed;
        try {
            embed = this.generateEmbed(modLogs, curStartIdx, endStartIdx);
        } catch (_) {
            await messageReply(this.ERROR_MESSAGE);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }
        const sentMessage: Message = await messageReply(embed);

        // Only display reactions if there is more than 1 page
        if (curStartIdx + 1 < endStartIdx) {
            await sentMessage.react(ModLogsCommand.PREV);
            await sentMessage.react(ModLogsCommand.NEXT);
        }

        // Filter for reaction collector
        const filter = (reaction: MessageReaction, user: User): boolean => {
            const { name } = reaction.emoji;
            const reactionUserId = user.id;

            // Only respond to reactions by the person who requested it.
            if (reactionUserId !== userId) {
                return false;
            }

            // If it's of the correct reactions, emit event
            if (name === ModLogsCommand.NEXT
                    || name === ModLogsCommand.PREV) {
                return true;
            }

            return false;
        };

        const collector = sentMessage.createReactionCollector({ filter, time: 60000, dispose: true });

        // onReaction function to handle the event
        const onReaction = async (reaction: MessageReaction): Promise<void> => {
            // Update the current page
            const { name } = reaction.emoji;
            switch (name) {
                case ModLogsCommand.NEXT:
                    curStartIdx = (curStartIdx + 1) % endStartIdx;
                    break;
                case ModLogsCommand.PREV:
                    curStartIdx = (curStartIdx - 1 + endStartIdx) % endStartIdx;
                    break;
                default:
                    return;
            }

            // Send the new page of logs
            const newEmbed = this.generateEmbed(
                modLogs,
                curStartIdx * ModLogsCommand.PAGE_SIZE,
                endStartIdx,
            );
            sentMessage.edit({ embeds: [newEmbed] });
        };
        collector.on('collect', onReaction);
        collector.on('remove', onReaction);
        collector.on('end', async () => {
            await sentMessage.reactions.removeAll();
        });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateEmbed(modLogs: ModLog[], startIdx: number, maxPages: number): MessageEmbed {
        const endIdx = Math.min(startIdx + ModLogsCommand.PAGE_SIZE, modLogs.length);
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.setTitle(`ModLogs Page ${startIdx / ModLogsCommand.PAGE_SIZE + 1} of ${maxPages}`);
        for (let i = startIdx; i < endIdx; ++i) {
            const {
                modId, userId, type, timeout, caseId, timestamp, reason,
            } = modLogs[i];
            const dateString = new Date(timestamp * 1000).toString();
            let desc = `Mod: <@!${modId}>
                        User: <@!${userId}>
                        Type: ${type}\n`;
            if (type === ModActions.BAN || type === ModActions.MUTE) {
                desc += 'Length: ';
                desc += timeout ? `${Math.floor((timeout / 60))} minutes` : 'Permanent';
                desc += '\n';
            }
            desc += `Date: ${dateString.substr(0, 21)}
                     Reason: ${reason || '-'}`;
            if (desc.length > 1024)
                desc = desc.substr(0, 1024);
            embed.addField(`Case #${caseId}`, desc);
        }
        return embed;
    }
}
