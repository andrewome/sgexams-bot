import { Client, GuildMemberManager } from 'discord.js';
import log from 'loglevel';
import { Storage } from '../storage/Storage';
import { EventHandler } from './EventHandler';
import { ModDbUtils } from '../modules/moderation/ModDbUtils';
import { ModUtils } from '../modules/moderation/ModUtil';
import { ModActions } from '../modules/moderation/classes/ModActions';
import { BirthdayAnnouncer } from '../modules/birthday/BirthdayAnnouncer';

export class ReadyEventHandler extends EventHandler {
    private bot: Client;

    public constructor(bot: Client, storage: Storage) {
        super(storage);
        this.bot = bot;
    }

    /**
     * This function handles the ready event of the bot. It fires when the bot has logged in.
     * It populates the starboard messages cache for each server that it is in
     * Then it checks for any outstanding timeouts (warns/bans).
     * Lastly it sets the bot's activity.
     *
     * @returns Promise
     */
    public async handleEvent(): Promise<void> {
        try {
            log.info('Handling outstanding timeouts...');
            this.handleTimeouts();

            // Announce outstanding birthdays.
            new BirthdayAnnouncer(this.bot, this.storage).start();

            log.info('I am ready!');
            await this.bot.user!.setActivity('with NUKES!!!!', { type: 'PLAYING' });
        } catch (err) {
            this.handleError(err);
        }
        // The activity seems to get reset every now and then... setInterval to set it every 1 hour
        setInterval(() => {
            this.bot.user!.setActivity('with NUKES!!!!', { type: 'PLAYING' });
        }, 1000 * 60 * 60);
    }

    /**
     * Handles timeouts in moderationTimeouts table upon booting
     *
     * @returns void
     */
    private handleTimeouts(): void {
        const timeouts = ModDbUtils.fetchActionTimeouts();
        const curTime = ModUtils.getUnixTime();
        timeouts.forEach((timeout) => {
            const {
                serverId, userId, type, startTime, endTime,
            } = timeout;
            const guild = this.bot.guilds.resolve(serverId);
            if (!guild) { // Guild can't be found
                // Remove entry if timeout expired
                if (endTime <= curTime)
                    ModDbUtils.removeActionTimeout(userId, type, serverId);
                return;
            }

            const { members } = guild;
            if (endTime > curTime) { // Timer has not expired yet, reset the timeout
                this.handleUnexpiredTimeouts(
                    serverId, userId, type, startTime, endTime, curTime, members,
                );
            } else { // Timers have expired
                this.handleExpiredTimeouts(
                    serverId, userId, startTime,
                    endTime, curTime, type, members,
                );
            }
        });
    }

    /**
     * Handles timeouts that have expired (current time >= end time)
     * Undoes the action and removes the entry.
     *
     * @param  {string} serverId
     * @param  {string} userId
     * @param  {string} startTime
     * @param  {string} endTime
     * @param  {number} curTime
     * @param  {ModActions} type
     * @param  {GuildMemberManager} members
     * @returns void
     */
    private handleExpiredTimeouts(serverId: string, userId: string, startTime: number,
                                  endTime: number, curTime: number, type: ModActions,
                                  members: GuildMemberManager): void {
        const emit = this.bot.emit.bind(this.bot);
        const botId = this.bot.user!.id;
        const actualDuration = (endTime - startTime) / 60;
        switch (type) {
            case ModActions.BAN: {
                const reason = `Unban after ${actualDuration} minutes`;
                ModDbUtils.addModerationAction(
                    serverId, botId, userId, ModActions.UNBAN, curTime, emit, reason,
                );
                ModUtils.handleUnbanTimeout(userId, serverId);
                members!.unban(userId)
                    .catch((err) => {
                        log.info(
                            `${err}: Unable to unban user ${userId} from server ${serverId}.`,
                        );
                    });
                break;
            }
            case ModActions.MUTE: {
                let muteRoleId = ModDbUtils.getMuteRoleId(serverId);
                // We set the mute role id to be a non-snowflake val if null as a blanket so that
                // GuildMemberRoleManager#remove can still work. Then try catch it.
                if (muteRoleId === null)
                    muteRoleId = '0';
                const reason = `Unmute after ${actualDuration} minutes`;
                ModDbUtils.addModerationAction(
                    serverId, botId, userId, ModActions.UNMUTE, curTime, emit, reason,
                );
                ModUtils.handleUnmuteTimeout(userId, serverId);
                members!.fetch(userId)
                    .then((user) => user.roles.remove(muteRoleId!))
                    .catch((err) => {
                        log.info(
                            `${err}: Unable to unmute user ${userId} from server ${serverId}.` +
                            `Mute role is ${muteRoleId}`,
                        );
                    });
                break;
            }
            default:
        }
    }

    /**
     * Handles timeouts that have not been expired (current time < end time)
     * Sets a timeout of duration that expires at end time that undoes the action.
     *
     * @param  {string} serverId
     * @param  {string} userId
     * @param  {ModActions} type
     * @param  {number} startTime
     * @param  {number} endTime
     * @param  {number} curTime
     * @param  {GuildMemberManager} members
     * @returns void
     */
    private handleUnexpiredTimeouts(serverId: string, userId: string, type: ModActions,
                                    startTime: number, endTime: number,
                                    curTime: number, members: GuildMemberManager): void {
        const emit = this.bot.emit.bind(this.bot);
        const botId = this.bot.user!.id;
        const duration = endTime - curTime;
        switch (type) {
            case ModActions.BAN:
                ModUtils.addBanTimeout(
                    duration, startTime, endTime, userId, serverId, botId, members, emit,
                );
                break;
            case ModActions.MUTE: {
                let muteRoleId = ModDbUtils.getMuteRoleId(serverId);
                // We set the mute role id to be a non-snowflake val if null as a blanket so that
                // GuildMemberRoleManager#remove can still work. Then try catch it.
                if (muteRoleId === null)
                    muteRoleId = '0';
                ModUtils.addMuteTimeout(
                    duration, startTime, endTime, userId, serverId,
                    botId, members, emit, muteRoleId,
                );
                break;
            }
            default:
        }
    }
}
