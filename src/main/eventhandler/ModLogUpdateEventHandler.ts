import { MessageEmbed, TextChannel, Client } from 'discord.js';
import { Storage } from '../storage/Storage';
import { EventHandler } from './EventHandler';
import { ModLog } from '../modules/moderation/classes/ModLog';
import { ModDbUtils } from '../modules/moderation/ModDbUtils';
import { ModActions } from '../modules/moderation/classes/ModActions';
import { Command } from '../command/Command';

export class ModLogUpdateEventHandler extends EventHandler {
    private modLog: ModLog;

    private bot: Client;

    public constructor(storage: Storage, bot: Client, modLog: ModLog) {
        super(storage);
        this.bot = bot;
        this.modLog = modLog;
    }

    /**
     * This function handles the ModLog update event. This event fires when an entry
     * is added to the moderationLogs table in the db.
     * It sends the update to the relevant channel (if set) in the relevant server.
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        try {
            const {
                serverId, caseId, modId, userId, type, reason, timeout, timestamp,
            } = this.modLog;

            // Get channel
            const channelId = ModDbUtils.getModLogChannel(serverId);

            // Error checks
            if (!channelId)
                return;
            const channel = this.bot.channels.resolve(channelId);
            if (!channel || channel.type !== 'text')
                return;

            // Create embed
            const embed = new MessageEmbed();
            embed.addField('Moderator', `<@${modId}>`, true);

            // Delete warn is a bit different
            if (type !== ModActions.UNWARN) {
                const user = await this.bot.users.fetch(userId);
                embed.setTitle(`Case ${caseId}: ${user.tag} (${userId})`);
                embed.addField('User', `<@${userId}>`, true);
            } else {
                embed.setTitle(`Case ${caseId}: Remove Warn`);
                embed.addField('Case ID', `${userId}`, true);
            }
            embed.addField('\u200b', '\u200b', true);
            embed.addField('Type', type, true);
            embed.addField('Reason', reason || '-', true);
            if (type === ModActions.MUTE || type === ModActions.BAN) {
                const timeoutStr = timeout ? `${Math.floor((timeout / 60))} minutes` : 'Permanent';
                embed.addField('Length', timeoutStr, true);
            }
            embed.setTimestamp(timestamp * 1000);
            embed.setColor(Command.EMBED_DEFAULT_COLOUR);
            await (channel as TextChannel).send(embed);
        } catch (err) {
            this.handleError(err);
        }
    }
}
