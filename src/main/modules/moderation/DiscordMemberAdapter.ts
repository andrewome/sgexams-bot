import {
    GuildMemberManager, DiscordAPIError, GuildMember, User,
} from 'discord.js';
import log from 'loglevel';
import { DiscordMemberPort, MemberActionResult, BanOptions } from './DiscordMemberPort';

/** Production DiscordMemberPort, backed by a real discord.js GuildMemberManager. */
export class DiscordMemberAdapter implements DiscordMemberPort {
    private members: GuildMemberManager;

    public constructor(members: GuildMemberManager) {
        this.members = members;
    }

    public async lookup(userId: string): Promise<MemberActionResult> {
        try {
            const member = await this.members.fetch(userId);
            return { ok: true, tag: member.user.tag };
        } catch (err) {
            return DiscordMemberAdapter.toFailure(err);
        }
    }

    public async ban(userId: string, options: BanOptions): Promise<MemberActionResult> {
        try {
            const result = await this.members.ban(userId, options);
            return { ok: true, tag: DiscordMemberAdapter.extractTag(result) };
        } catch (err) {
            return DiscordMemberAdapter.toFailure(err);
        }
    }

    public async unban(userId: string): Promise<MemberActionResult> {
        try {
            const user = await this.members.unban(userId);
            if (!user)
                return { ok: false };
            return { ok: true, tag: user.tag };
        } catch (err) {
            return DiscordMemberAdapter.toFailure(err);
        }
    }

    public async kick(userId: string, reason?: string): Promise<MemberActionResult> {
        try {
            const member = await this.members.fetch(userId);
            await member.kick(reason);
            return { ok: true, tag: member.user.tag };
        } catch (err) {
            return DiscordMemberAdapter.toFailure(err);
        }
    }

    public async timeout(userId: string, durationMs: number | null, reason?: string): Promise<MemberActionResult> {
        try {
            const member = await this.members.fetch(userId);
            await member.timeout(durationMs, reason);
            return { ok: true, tag: member.user.tag };
        } catch (err) {
            return DiscordMemberAdapter.toFailure(err);
        }
    }

    private static toFailure(err: unknown): MemberActionResult {
        if (err instanceof DiscordAPIError) {
            log.info(err);
            return { ok: false };
        }
        throw err;
    }

    private static extractTag(result: GuildMember | User | string): string {
        if (typeof result === 'string')
            return result;
        if ('user' in result)
            return result.user.tag;
        return result.tag;
    }
}
