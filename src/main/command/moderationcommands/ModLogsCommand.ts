import {
    Permissions, MessageEmbed, TextChannel, MessageReaction, User, ReactionCollectorOptions,
} from 'discord.js';
import { Command } from '../Command';
import { CommandArgs } from '../classes/CommandArgs';
import { CommandResult } from '../classes/CommandResult';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';
import { ModLog } from '../../modules/moderation/classes/ModLog';
import { ModActions } from '../../modules/moderation/classes/ModActions';

export class ModLogsCommand extends Command {
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

    private userId: string | null;

    private type: string | null;

    private complementType: string | null;

    constructor(args: string[]) {
        super();

        if (args.length === 1) {
            if (args[0].toUpperCase() in ModActions) {
                // The argument is a `type` argument
                [this.type] = args;
                this.type = this.type.toUpperCase();
                this.complementType = `UN${this.type}`;
                this.userId = null;
            } else {
                [this.userId] = args;
                this.type = null;
                this.complementType = null;
            }
        } else if (args.length === 2) {
            [this.userId, this.type] = args;
            this.type = this.type.toUpperCase();
            this.complementType = `UN${this.type}`;
        } else {
            this.userId = null;
            this.type = null;
            this.complementType = null;
        }
    }

    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            server, memberPerms, messageReply, channel, userId,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            this.sendNoPermissionsMessage(messageReply);
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
            messageReply(embed);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        const endStartIdx = Math.ceil(modLogs.length / ModLogsCommand.PAGE_SIZE);
        let curStartIdx = 0;

        // Send the initial message
        (channel as TextChannel).startTyping();
        let embed: MessageEmbed;
        try {
            embed = this.generateValidEmbed(modLogs, curStartIdx, endStartIdx);
        } catch (_) {
            messageReply(this.ERROR_MESSAGE);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }
        const sentMessage = await messageReply(embed);

        // Only display reactions if there is more than 1 page
        if (curStartIdx + 1 < endStartIdx) {
            await sentMessage.react(ModLogsCommand.PREV);
            await sentMessage.react(ModLogsCommand.NEXT);
        }
        (channel as TextChannel).stopTyping();

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

        // Options
        const options: ReactionCollectorOptions = { time: 30000 };
        const collector = sentMessage.createReactionCollector(filter, options);

        // onReaction function to handle the event
        const onReaction = async (reaction: MessageReaction): Promise<void> => {
            (channel as TextChannel).startTyping();

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
            const newEmbed = this.generateValidEmbed(
                modLogs,
                curStartIdx * ModLogsCommand.PAGE_SIZE,
                endStartIdx,
            );
            sentMessage.edit(newEmbed);
            await sentMessage.reactions.removeAll();
            await sentMessage.react(ModLogsCommand.PREV);
            await sentMessage.react(ModLogsCommand.NEXT);

            (channel as TextChannel).stopTyping();
        };
        collector.on('collect', onReaction);

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    private generateValidEmbed(
        modLogs: ModLog[], startIdx: number, maxPages: number,
    ): MessageEmbed {
        const endIdx = Math.min(startIdx + ModLogsCommand.PAGE_SIZE, modLogs.length);
        const embed = new MessageEmbed();
        embed.setColor(Command.EMBED_DEFAULT_COLOUR);
        embed.setTitle(`Mod logs page ${startIdx / ModLogsCommand.PAGE_SIZE + 1} of ${maxPages}`);
        for (let i = startIdx; i < endIdx; ++i) {
            const dateString = new Date(modLogs[i].timestamp * 1000).toString();
            const desc = `
                Mod: <@!${modLogs[i].modId}>
                User: <@!${modLogs[i].userId}>
                Type: ${modLogs[i].type}
                Date: ${dateString.substr(0, 21)}
                Reason: ${modLogs[i].reason || '-'}
            `;
            embed.addField(`Case #${modLogs[i].caseId}`, desc);
        }
        return embed;
    }
}
