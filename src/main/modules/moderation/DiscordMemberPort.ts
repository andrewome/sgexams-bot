import { EmbedBuilder } from 'discord.js';

/** Result of a DiscordMemberPort action. On success, carries the target's display tag. */
export type MemberActionResult =
    | { ok: true; tag: string }
    | { ok: false };

export interface BanOptions {
    reason?: string;
    deleteMessageSeconds?: number;
}

export interface DmOptions {
    embeds: EmbedBuilder[];
}

/**
 * The seam between moderation commands and discord.js's GuildMemberManager/GuildMember.
 * Methods never throw on a bad/unknown user id - they resolve to { ok: false } instead,
 * so callers don't each need their own try/catch around a DiscordAPIError.
 *
 * See ADR-0002.
 */
export interface DiscordMemberPort {
    /** Looks up a member without taking any action - for validating/displaying a user. */
    lookup(userId: string): Promise<MemberActionResult>;

    ban(userId: string, options: BanOptions): Promise<MemberActionResult>;

    unban(userId: string): Promise<MemberActionResult>;

    kick(userId: string, reason?: string): Promise<MemberActionResult>;

    /** Pass durationMs: null to clear an existing timeout. */
    timeout(userId: string, durationMs: number | null, reason?: string): Promise<MemberActionResult>;

    /** Best-effort - a DM failure (DMs closed, bot blocked, user left) is a normal outcome. */
    dm(userId: string, options: DmOptions): Promise<MemberActionResult>;
}
