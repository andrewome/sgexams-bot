import { EmbedBuilder, GuildMemberManager } from 'discord.js';
import log from 'loglevel';
import { ModActions } from './classes/ModActions';
import { ModDbUtils } from './ModDbUtils';
import { Command } from '../../command/Command';

export class ModUtils {
    public static readonly MINUTES_IN_SECONDS = 60;

    public static readonly HOURS_IN_SECONDS = ModUtils.MINUTES_IN_SECONDS * 60;

    public static readonly DAYS_IN_SECONDS = ModUtils.HOURS_IN_SECONDS * 24;

    /**
     * setTimeout's delay is a 32-bit signed int (~24.85 day max). Both setMuteTimeout and
     * setBanTimeout schedule a JS timer for a user-supplied duration, so any duration accepted
     * by MuteCommand, BanCommand, or SetWarnPunishments is capped here at 21 days - a round
     * number safely under that limit. (Discord's own timeout limit is 28 days, but the JS
     * timer is the tighter constraint mute must respect; bans have no Discord-side cap at all,
     * so this is the only limit on ban duration.)
     */
    public static readonly MAX_TIMEOUT_DURATION_SECONDS = ModUtils.DAYS_IN_SECONDS * 21;

    public static readonly timers: Map<number, NodeJS.Timeout> = new Map();

    /**
     * Formats a duration in seconds as a word-style string, eg. "3 days, 5 hours and 10
     * minutes". Zero-valued larger units are omitted, eg. a 90 minute duration formats as
     * "1 hour and 30 minutes", not "0 days, 1 hour and 30 minutes".
     *
     * @param  {number} totalSeconds
     * @returns string
     */
    public static formatDuration(totalSeconds: number): string {
        let remaining = totalSeconds;
        const days = Math.floor(remaining / ModUtils.DAYS_IN_SECONDS);
        remaining -= days * ModUtils.DAYS_IN_SECONDS;
        const hours = Math.floor(remaining / ModUtils.HOURS_IN_SECONDS);
        remaining -= hours * ModUtils.HOURS_IN_SECONDS;
        const minutes = Math.floor(remaining / ModUtils.MINUTES_IN_SECONDS);

        const pluralise = (value: number, unit: string): string => `${value} ${unit}${value === 1 ? '' : 's'}`;

        const parts: string[] = [];
        if (days > 0)
            parts.push(pluralise(days, 'day'));
        if (hours > 0)
            parts.push(pluralise(hours, 'hour'));
        if (minutes > 0 || parts.length === 0)
            parts.push(pluralise(minutes, 'minute'));

        if (parts.length === 1)
            return parts[0];
        return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
    }

    /**
     * Builds the "Action notice" DM embed sent to a user after a mute/kick/ban (see
     * CONTEXT.md, ADR-0004) - not on Command, since Command is the generic base every
     * command family uses (Starboard, MsgChecker, Birthday too), not just moderation.
     *
     * Pass duration to show it (formatted if a number, "Permanent" if null); omit it
     * entirely for actions with no duration concept, eg. kick.
     *
     * @param  {string} action past-tense action word
     * @param  {string} serverName
     * @param  {string} reason
     * @param  {string} modId the moderator (or the bot itself, for auto-escalation)
     * @param  {number|null} duration
     * @returns EmbedBuilder
     */
    public static buildActionNoticeEmbed(action: 'muted' | 'kicked' | 'banned', serverName: string, reason: string,
                                         modId: string, duration?: number | null): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setColor(Command.EMBED_DEFAULT_COLOUR)
            .setTitle(`You were ${action} in ${serverName}`)
            .addFields({ name: 'Reason', value: reason || '-' });

        if (duration !== undefined) {
            embed.addFields({
                name: 'Duration',
                value: duration === null ? 'Permanent' : ModUtils.formatDuration(duration),
            });
        }

        embed.addFields({ name: 'Moderator', value: `<@${modId}>` });
        return embed;
    }

    /**
     * Adds a "Notified" field to a moderator's confirmation embed, but only when the
     * Action notice DM failed to send - success needs no extra line. The raw DiscordAPIError
     * is logged (see DiscordMemberAdapter.toFailure), not shown here - this is a friendly
     * summary, not diagnostic detail. See ADR-0004.
     *
     * @param  {EmbedBuilder} embed
     * @param  {boolean} notified
     * @returns void
     */
    public static addDmFailureNotice(embed: EmbedBuilder, notified: boolean): void {
        if (!notified) {
            embed.addFields({
                name: 'Notified',
                value: 'Could not DM this user - they may have DMs disabled or have blocked the bot.',
            });
        }
    }

    /**
     * Parses a string in the form X{m|h|d} where X is an integer greater than 0.
     * Returns null if string is malformed, else number of seconds
     *
     * @param  {string}
     * @returns number
     */
    public static parseDuration(str: string): number | null {
        const { MINUTES_IN_SECONDS, HOURS_IN_SECONDS, DAYS_IN_SECONDS } = ModUtils;
        const m: Map<string, number>
            = new Map([['m', MINUTES_IN_SECONDS], ['h', HOURS_IN_SECONDS], ['d', DAYS_IN_SECONDS]]);

        if (!str)
            return null;

        str = str.toLowerCase();
        const match = /(\d+)(m|h|d)/g.exec(str);
        if (match) {
            // Get index 1 and 2 of the match arr
            const { 1: duration, 2: type } = match;
            if (Number.parseInt(duration, 10) < 1)
                return null;
            return Number.parseInt(duration, 10) * m.get(type)!;
        }

        return null;
    }

    /**
     * Returns # of seconds since unix epoch
     *
     * @returns number
     */
    public static getUnixTime(): number {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * Assigns a random ID to a timeout stored in timers map
     *
     * @param  {NodeJS.Timeout} timer
     * @returns number ID mapped to that timer
     */
    private static assignTimeout(timer: NodeJS.Timeout): number {
        // Generates an integer from 1 to 2^31 - 1
        const genRandom = (): number => Math.floor(Math.random() * (2 ** 31 - 2)) + 1;
        const { timers } = ModUtils;
        let rand = genRandom();
        while (timers.has(rand))
            rand = genRandom();

        timers.set(rand, timer);
        return rand;
    }

    /**
     * Deletes entry from the timers map and clears the timeout if exists
     *
     * @param  {number} timerId
     * @returns void
     */
    private static removeTimeout(timerId: number): void {
        const { timers } = ModUtils;
        if (timers.has(timerId)) {
            log.info(`Removing timerId: ${timerId}`);
            clearTimeout(timers.get(timerId)!);
            timers.delete(timerId);
        }
    }

    /**
     * This function adds the ban timeout to the database and calls setBanTimeout
     * We need the timeout duration for the setTimeout function as startTime and endTime
     * duration passed into this function may not reflect the actual length of the ban.
     * ie if the bot is restarted, the actual startTime will be reflected in the database
     *
     * @param  {number} timeoutDuration
     * @param  {number} startTime
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {string} botId
     * @param  {GuildMemberManager} guildMemberManager
     * @param  {Function} emit
     * @returns void
     */
    public static addBanTimeout(timeoutDuration: number, startTime: number, endTime: number,
                                userId: string, serverId: string, botId: string,
                                guildMemberManager: GuildMemberManager, emit: Function): void {
        const timer =
            ModUtils.setBanTimeout(
                timeoutDuration, startTime, endTime, userId,
                serverId, botId, guildMemberManager, emit,
            );

        const timerId = ModUtils.assignTimeout(timer);

        ModDbUtils.addActionTimeout(
            startTime, endTime, userId, ModActions.BAN, serverId, timerId,
        );
    }

    /**
     * This function handles the timeout of the ban to unban the user when timeout is up.
     *
     * @param  {number} timeoutDuration
     * @param  {number} startTime
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {string} botId
     * @param  {GuildMemberManager} guildMemberManager
     * @param  {Function} emit
     * @returns NodeJS.Timeout
     */
    public static setBanTimeout(timeoutDuration: number, startTime: number, endTime: number,
                                userId: string, serverId: string, botId: string,
                                guildMemberManager: GuildMemberManager,
                                emit: Function): NodeJS.Timeout {
        const callback = (): void => {
            // Deliberately left as raw minutes - this is a developer-facing log line, not the
            // user-facing reason text below, which uses ModUtils.formatDuration.
            const actualDuration = Math.floor((endTime - startTime) / 60);
            log.info(`Unbanning ${userId} after ${actualDuration} minutes timeout.`);
            // Unban member
            guildMemberManager.unban(userId)
                .catch((err) => {
                    log.info(err);
                    log.info(`Unable to unban user ${userId} from server ${serverId}.`);
                });

            // Remove entry from db
            const timerId = ModDbUtils.removeActionTimeout(userId, ModActions.BAN, serverId);

            // Remove timer from timers map
            ModUtils.removeTimeout(timerId);

            // Add unban entry to db
            const reason = `Unban after ${ModUtils.formatDuration(endTime - startTime)}`;
            ModDbUtils.addModerationAction(
                serverId, botId, userId, ModActions.UNBAN, ModUtils.getUnixTime(), emit, reason,
            );
            log.info(`Done removing ${userId} from Database.`);
        };

        return setTimeout(callback, timeoutDuration * 1000);
    }

    /**
     * Removes ban timeout if exists
     *
     * @param  {string} userId
     * @param  {string} serverId
     * @returns void
     */
    public static handleUnbanTimeout(userId: string, serverId: string): void {
        const timerId = ModDbUtils.removeActionTimeout(userId, ModActions.BAN, serverId);
        if (timerId) {
            ModUtils.removeTimeout(timerId);
        }
    }

    /**
     * This function adds the mute timeout to the database and calls setMuteTimeout.
     * We need the timeout duration for the setTimeout function as startTime and endTime
     * duration passed into this function may not reflect the actual length of the mute.
     * ie if the bot is restarted, the actual startTime will be reflected in the database.
     *
     * Discord expires the member's timeout natively, so this only needs to record the
     * UNMUTE audit log entry when the mute would have ended - it does not touch Discord.
     *
     * @param  {number} startTime
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {string} botId
     * @param  {Function} emit
     * @returns void
     */
    public static addMuteTimeout(timeoutDuration: number, startTime: number, endTime: number,
                                 userId: string, serverId: string, botId: string,
                                 emit: Function): void {
        const timer = ModUtils.setMuteTimeout(
            timeoutDuration, startTime, endTime, userId, serverId, botId, emit,
        );

        const timerId = ModUtils.assignTimeout(timer);

        ModDbUtils.addActionTimeout(
            startTime, endTime, userId, ModActions.MUTE, serverId, timerId,
        );
    }

    /**
     * This function handles the timeout of the mute, recording the UNMUTE audit log entry
     * when the timeout is up. Discord expires the member's timeout on its own; this does not
     * make any Discord API call.
     *
     * @param  {number} timeoutDuration
     * @param  {number} startTime
     * @param  {number} endTime
     * @param  {string} userId
     * @param  {string} serverId
     * @param  {string} botId
     * @param  {Function} emit
     * @returns NodeJS.Timeout
     */
    public static setMuteTimeout(timeoutDuration: number, startTime: number, endTime: number,
                                 userId: string, serverId: string, botId: string,
                                 emit: Function): NodeJS.Timeout {
        const callback = (): void => {
            // Deliberately left as raw minutes - this is a developer-facing log line, not the
            // user-facing reason text below, which uses ModUtils.formatDuration.
            const actualDuration = Math.floor((endTime - startTime) / 60);
            log.info(`Recording auto-unmute for ${userId} after ${actualDuration} minutes timeout.`);

            // Remove entry from db
            const timerId = ModDbUtils.removeActionTimeout(userId, ModActions.MUTE, serverId);

            // Remove timer from timers map
            ModUtils.removeTimeout(timerId);

            // Add unmute entry to db
            const reason = `Unmute after ${ModUtils.formatDuration(endTime - startTime)}`;
            ModDbUtils.addModerationAction(
                serverId, botId, userId, ModActions.UNMUTE, ModUtils.getUnixTime(), emit, reason,
            );
            log.info(`Done removing ${userId} from Database.`);
        };

        return setTimeout(callback, timeoutDuration * 1000);
    }

    /**
     * Removes timeout if exists
     *
     * @param  {string} userId
     * @param  {string} serverId
     * @returns void
     */
    public static handleUnmuteTimeout(userId: string, serverId: string): void {
        const timerId = ModDbUtils.removeActionTimeout(userId, ModActions.MUTE, serverId);
        if (timerId) {
            ModUtils.removeTimeout(timerId);
        }
    }
}
